// tests/integration/symptom.test.js
const request = require("supertest");
const app = require("../../server"); // adjust path to your exported Express app
const db = require("../../src/db");  // if you need to clean up

describe("Symptom flow (integration)", () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);
    // create & log in a test patient
    await agent
      .post("/api/auth/register")
      .send({ email: "test-patient@example.com", password: "P@ssw0rd!", role: "patient" });
    // assume register auto–logs in or redirects to login; if not:
    await agent
      .post("/api/auth/login")
      .send({ email: "test-patient@example.com", password: "P@ssw0rd!" });
  });

  afterAll(async () => {
    // teardown: drop test data
    await db.query(`DELETE FROM patient_symptoms WHERE patient_id IN (
      SELECT id FROM patients WHERE user_id=(SELECT id FROM users WHERE email='test-patient@example.com')
    )`);
    await db.query(`DELETE FROM symptoms WHERE name='IntegrationTestSymptom'`);
    await db.query(`DELETE FROM patients WHERE user_id=(SELECT id FROM users WHERE email='test-patient@example.com')`);
    await db.query(`DELETE FROM users WHERE email='test-patient@example.com'`);
    await db.end();
  });

  it("rejects invalid submissions", async () => {
    const res = await agent.post("/api/symptoms/log").send({});  
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.message)).toBe(true);
  });

  it("logs a new symptom and shows up in history", async () => {
    // log a new symptom
    const payload = {
      symptomName: "IntegrationTestSymptom",
      description: "Integration test description",
      severity: "Mild",
      duration: "1h",
      notes: "none"
    };
    const logRes = await agent.post("/api/symptoms/log").send(payload);
    expect(logRes.status).toBe(201);
    expect(logRes.body).toEqual({ message: "Symptom logged successfully" });

    // fetch history and assert presence
    const histRes = await agent.get("/api/symptoms/history");
    expect(histRes.status).toBe(200);
    expect(histRes.body.some(e => e.symptom_name === "IntegrationTestSymptom")).toBe(true);
  });
});
