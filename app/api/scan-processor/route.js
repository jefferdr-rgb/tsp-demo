// ── Batch Scan Processor API ─────────────────────────────────────────────────
// Receives scanned document(s), classifies with Claude Vision, extracts structured data.
// Supports: receipts, invoices, SOPs, incident forms, compliance checklists,
//           business cards, maintenance logs, timesheets, delivery tickets, equipment specs.

export const maxDuration = 60; // Pro plan — 60s timeout for large batches

const DOC_TYPES = {
  receipt: { label: "Receipt / Expense", icon: "🧾", color: "#c49b2a" },
  invoice: { label: "Invoice / Bill", icon: "📄", color: "#2c3528" },
  sop: { label: "SOP / Procedure", icon: "📋", color: "#4a6540" },
  incident: { label: "Incident Report", icon: "⚠️", color: "#c0392b" },
  compliance: { label: "Compliance / Checklist", icon: "✅", color: "#2980b9" },
  business_card: { label: "Business Card", icon: "💼", color: "#7a7462" },
  maintenance_log: { label: "Maintenance Log", icon: "🔧", color: "#e67e22" },
  timesheet: { label: "Timesheet / Hours", icon: "⏰", color: "#8e44ad" },
  delivery_ticket: { label: "Delivery / Packing Slip", icon: "📦", color: "#16a085" },
  equipment_spec: { label: "Equipment / Manual", icon: "⚙️", color: "#34495e" },
  other: { label: "Other Document", icon: "📝", color: "#7a7462" },
};

// Step 1: Classify the document
async function classifyDocument(imageBlock, apiKey) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: "You classify scanned documents. Return ONLY the document type — nothing else.",
      messages: [{
        role: "user",
        content: [
          imageBlock,
          {
            type: "text",
            text: `Classify this scanned document as exactly one of: ${Object.keys(DOC_TYPES).join(", ")}. Return ONLY the type keyword, nothing else.`,
          },
        ],
      }],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const raw = (data.content?.[0]?.text || "other").trim().toLowerCase().replace(/[^a-z_]/g, "");
  return DOC_TYPES[raw] ? raw : "other";
}

// Step 2: Extract structured data based on document type
async function extractData(imageBlock, docType, apiKey) {
  const extractionConfigs = {
    receipt: {
      tool: "extract_receipt",
      description: "Extract receipt/expense data",
      schema: {
        type: "object",
        properties: {
          vendor: { type: ["string", "null"], description: "Store/vendor name" },
          date: { type: ["string", "null"], description: "Transaction date (YYYY-MM-DD)" },
          subtotal: { type: ["number", "null"], description: "Subtotal before tax" },
          tax: { type: ["number", "null"], description: "Tax amount" },
          total: { type: ["number", "null"], description: "Total amount" },
          payment_method: { type: ["string", "null"], description: "Cash, credit, check, etc." },
          category: { type: ["string", "null"], description: "Expense category (supplies, equipment, food, travel, maintenance, utilities, other)" },
          line_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                quantity: { type: ["number", "null"] },
                unit_price: { type: ["number", "null"] },
                amount: { type: ["number", "null"] },
              },
            },
            description: "Individual line items if visible",
          },
          notes: { type: ["string", "null"], description: "Any other relevant info (PO number, account number, etc.)" },
        },
        required: ["vendor", "total"],
      },
    },
    invoice: {
      tool: "extract_invoice",
      description: "Extract invoice/bill data",
      schema: {
        type: "object",
        properties: {
          vendor: { type: ["string", "null"], description: "Company issuing the invoice" },
          invoice_number: { type: ["string", "null"], description: "Invoice/bill number" },
          date: { type: ["string", "null"], description: "Invoice date (YYYY-MM-DD)" },
          due_date: { type: ["string", "null"], description: "Payment due date (YYYY-MM-DD)" },
          subtotal: { type: ["number", "null"] },
          tax: { type: ["number", "null"] },
          total: { type: ["number", "null"], description: "Total amount due" },
          status: { type: ["string", "null"], description: "paid, unpaid, overdue, partial" },
          line_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                quantity: { type: ["number", "null"] },
                unit_price: { type: ["number", "null"] },
                amount: { type: ["number", "null"] },
              },
            },
          },
          payment_terms: { type: ["string", "null"], description: "Net 30, Net 60, etc." },
          po_number: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
        },
        required: ["vendor", "total"],
      },
    },
    business_card: {
      tool: "extract_contact",
      description: "Extract contact information from business card",
      schema: {
        type: "object",
        properties: {
          full_name: { type: ["string", "null"] },
          title: { type: ["string", "null"], description: "Job title" },
          company: { type: ["string", "null"] },
          email: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          mobile: { type: ["string", "null"] },
          address: { type: ["string", "null"] },
          website: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
        },
        required: ["full_name"],
      },
    },
    sop: {
      tool: "extract_sop",
      description: "Extract and structure a Standard Operating Procedure",
      schema: {
        type: "object",
        properties: {
          title: { type: ["string", "null"], description: "Procedure name/title" },
          department: { type: ["string", "null"] },
          equipment: { type: ["string", "null"], description: "Equipment or area this SOP applies to" },
          ppe_required: { type: "array", items: { type: "string" }, description: "Personal protective equipment needed" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_number: { type: "number" },
                action: { type: "string" },
                warning: { type: ["string", "null"], description: "Safety warning if any" },
              },
            },
          },
          safety_warnings: { type: "array", items: { type: "string" } },
          quality_checks: { type: "array", items: { type: "string" } },
          raw_text: { type: ["string", "null"], description: "Full transcribed text if handwritten" },
          notes: { type: ["string", "null"] },
        },
        required: ["title"],
      },
    },
    incident: {
      tool: "extract_incident",
      description: "Extract incident report data",
      schema: {
        type: "object",
        properties: {
          date: { type: ["string", "null"], description: "Incident date (YYYY-MM-DD)" },
          time: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          equipment_involved: { type: ["string", "null"] },
          description: { type: ["string", "null"], description: "What happened" },
          severity: { type: ["string", "null"], description: "minor, moderate, serious, critical" },
          injuries: { type: ["string", "null"] },
          witnesses: { type: "array", items: { type: "string" } },
          reported_by: { type: ["string", "null"] },
          corrective_action: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
        },
        required: ["description"],
      },
    },
    compliance: {
      tool: "extract_compliance",
      description: "Extract compliance checklist data with pass/fail scoring",
      schema: {
        type: "object",
        properties: {
          title: { type: ["string", "null"], description: "Checklist/audit name" },
          date: { type: ["string", "null"] },
          inspector: { type: ["string", "null"] },
          area: { type: ["string", "null"], description: "Area or department inspected" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string", description: "Checklist item description" },
                status: { type: "string", description: "pass, fail, na, partial" },
                note: { type: ["string", "null"] },
              },
            },
          },
          total_items: { type: ["number", "null"] },
          passed: { type: ["number", "null"] },
          failed: { type: ["number", "null"] },
          score_percent: { type: ["number", "null"] },
          critical_findings: { type: "array", items: { type: "string" } },
          notes: { type: ["string", "null"] },
        },
        required: ["title"],
      },
    },
    maintenance_log: {
      tool: "extract_maintenance",
      description: "Extract maintenance record data",
      schema: {
        type: "object",
        properties: {
          date: { type: ["string", "null"] },
          equipment: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          type: { type: ["string", "null"], description: "preventive, corrective, emergency" },
          description: { type: ["string", "null"], description: "Work performed" },
          parts_used: { type: "array", items: { type: "string" } },
          performed_by: { type: ["string", "null"] },
          hours: { type: ["number", "null"], description: "Labor hours" },
          cost: { type: ["number", "null"] },
          next_scheduled: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
        },
        required: ["equipment", "description"],
      },
    },
    timesheet: {
      tool: "extract_timesheet",
      description: "Extract timesheet/hours data",
      schema: {
        type: "object",
        properties: {
          employee_name: { type: ["string", "null"] },
          period: { type: ["string", "null"], description: "Pay period or week" },
          entries: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: ["string", "null"] },
                hours_regular: { type: ["number", "null"] },
                hours_overtime: { type: ["number", "null"] },
                department: { type: ["string", "null"] },
              },
            },
          },
          total_regular: { type: ["number", "null"] },
          total_overtime: { type: ["number", "null"] },
          total_hours: { type: ["number", "null"] },
          notes: { type: ["string", "null"] },
        },
        required: ["employee_name"],
      },
    },
    delivery_ticket: {
      tool: "extract_delivery",
      description: "Extract delivery/packing slip data",
      schema: {
        type: "object",
        properties: {
          vendor: { type: ["string", "null"] },
          delivery_date: { type: ["string", "null"] },
          po_number: { type: ["string", "null"] },
          tracking_number: { type: ["string", "null"] },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                quantity_ordered: { type: ["number", "null"] },
                quantity_received: { type: ["number", "null"] },
                unit: { type: ["string", "null"] },
              },
            },
          },
          received_by: { type: ["string", "null"] },
          condition: { type: ["string", "null"], description: "good, damaged, partial" },
          discrepancies: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
        },
        required: ["vendor"],
      },
    },
    equipment_spec: {
      tool: "extract_equipment",
      description: "Extract equipment specification data",
      schema: {
        type: "object",
        properties: {
          name: { type: ["string", "null"], description: "Equipment name/model" },
          manufacturer: { type: ["string", "null"] },
          model_number: { type: ["string", "null"] },
          serial_number: { type: ["string", "null"] },
          specs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                parameter: { type: "string" },
                value: { type: "string" },
              },
            },
          },
          operating_ranges: { type: ["string", "null"] },
          maintenance_interval: { type: ["string", "null"] },
          notes: { type: ["string", "null"] },
        },
        required: ["name"],
      },
    },
    other: {
      tool: "extract_document",
      description: "Extract key information from a general document",
      schema: {
        type: "object",
        properties: {
          title: { type: ["string", "null"] },
          date: { type: ["string", "null"] },
          author: { type: ["string", "null"] },
          summary: { type: ["string", "null"], description: "Brief summary of the document contents" },
          key_data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                value: { type: "string" },
              },
            },
            description: "Key data points extracted",
          },
          raw_text: { type: ["string", "null"], description: "Full transcribed text" },
          notes: { type: ["string", "null"] },
        },
        required: ["summary"],
      },
    },
  };

  const config = extractionConfigs[docType] || extractionConfigs.other;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: `You are RHONDA, an AI assistant for manufacturing and business operations. Extract ALL visible data from this scanned ${DOC_TYPES[docType]?.label || "document"}. Be thorough — capture every field, line item, and detail you can read. If handwritten, transcribe carefully. For numbers, use numeric values (not strings). For dates, use YYYY-MM-DD format when possible.`,
      messages: [{
        role: "user",
        content: [
          imageBlock,
          { type: "text", text: `Extract all data from this ${DOC_TYPES[docType]?.label || "document"}.` },
        ],
      }],
      tools: [{
        name: config.tool,
        description: config.description,
        input_schema: config.schema,
      }],
      tool_choice: { type: "tool", name: config.tool },
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const toolResult = data.content?.find(b => b.type === "tool_use" && b.name === config.tool);
  if (!toolResult?.input) throw new Error("Failed to extract document data");

  return toolResult.input;
}

// ── Main handler ────────────────────────────────────────────────────────────
export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "API key not configured" }, { status: 500 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Accept single document or batch
  // Each doc: { imageBlock: { type: "image", source: {...} }, fileName?: string }
  const documents = body.documents || (body.imageBlock ? [{ imageBlock: body.imageBlock, fileName: body.fileName }] : []);

  if (documents.length === 0) {
    return Response.json({ error: "No documents provided" }, { status: 400 });
  }

  // Verify auth for external callers (Apps Script)
  const authHeader = request.headers.get("x-rhonda-key");
  const isExternal = !!authHeader;
  if (isExternal && authHeader !== process.env.RHONDA_SCAN_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];

  for (const doc of documents) {
    try {
      // Step 1: Classify
      const docType = await classifyDocument(doc.imageBlock, apiKey);

      // Step 2: Extract
      const extracted = await extractData(doc.imageBlock, docType, apiKey);

      results.push({
        fileName: doc.fileName || `Document ${results.length + 1}`,
        docType,
        docTypeInfo: DOC_TYPES[docType],
        extracted,
        status: "success",
      });
    } catch (err) {
      results.push({
        fileName: doc.fileName || `Document ${results.length + 1}`,
        docType: "other",
        docTypeInfo: DOC_TYPES.other,
        extracted: null,
        status: "error",
        error: err.message,
      });
    }
  }

  // Generate spreadsheet data for financial documents
  const financialDocs = results.filter(r =>
    r.status === "success" && (r.docType === "receipt" || r.docType === "invoice")
  );

  let spreadsheetData = null;
  if (financialDocs.length > 0) {
    const isReceipts = financialDocs.some(d => d.docType === "receipt");
    const isInvoices = financialDocs.some(d => d.docType === "invoice");

    if (isReceipts) {
      spreadsheetData = spreadsheetData || {};
      spreadsheetData.expenses = {
        headers: ["Vendor", "Date", "Category", "Subtotal", "Tax", "Total", "Payment Method", "Notes"],
        rows: financialDocs
          .filter(d => d.docType === "receipt")
          .map(d => {
            const e = d.extracted;
            return [e.vendor, e.date, e.category, e.subtotal, e.tax, e.total, e.payment_method, e.notes];
          }),
      };
    }
    if (isInvoices) {
      spreadsheetData = spreadsheetData || {};
      spreadsheetData.payables = {
        headers: ["Vendor", "Invoice #", "Date", "Due Date", "Total", "Status", "PO #", "Terms"],
        rows: financialDocs
          .filter(d => d.docType === "invoice")
          .map(d => {
            const e = d.extracted;
            return [e.vendor, e.invoice_number, e.date, e.due_date, e.total, e.status, e.po_number, e.payment_terms];
          }),
      };
    }
  }

  return Response.json({
    processed: results.length,
    successful: results.filter(r => r.status === "success").length,
    results,
    spreadsheetData,
    docTypes: DOC_TYPES,
  });
}
