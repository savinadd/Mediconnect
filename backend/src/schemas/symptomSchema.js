const { z } = require("zod");

const trimPreprocess = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : val),
  z.string()
);

const symptomSchema = z.object({
  symptomName: trimPreprocess.optional(),
  name:        trimPreprocess.optional(),
  description: trimPreprocess,        // required
  severity:    trimPreprocess.optional(),
  duration:    trimPreprocess.optional(),
  notes:       trimPreprocess.optional(),
});

module.exports = { symptomSchema };
