import { createLogSchema } from "./aiAgentLog.schema.js";
import { createLog, getLogsBySession } from "./aiAgentLog.service.js";

export async function createAIAgentLog(req, res) {
  try {
    const { error, value } = createLogSchema.validate(req.body);
    if (error)
      return res.status(400).json({ success: false, message: error.details.map(d => d.message).join(", ") });

    const log = await createLog(value);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getLogs(req, res) {
  try {
    const { session_id } = req.params;
    const logs = await getLogsBySession(session_id);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
