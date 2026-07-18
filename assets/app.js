(function () {
  "use strict";

  const incidents = [
    {
      id: "ATM-2041",
      title: "Cash recycler jam after cassette refill",
      text: "Downtown ATM 2041 reports cash recycler jam after morning cassette refill. Three failed withdrawals were reversed by host. Prior jam alert happened twice in seven days. Site is open, camera working, no customer funds retained.",
      history: "Two recycler jams in seven days after refill window.",
      location: "Downtown branch vestibule",
      device: "ATM recycler",
      businessImpact: "Customer access disruption and repeated technician context risk."
    },
    {
      id: "KSK-118",
      title: "Kiosk screen frozen during check-in",
      text: "Clinic check-in kiosk 118 is frozen on consent screen after overnight update. Staff can still check patients in manually. No payment data is stored on the kiosk. Restart clears it for 20 minutes then it freezes again.",
      history: "New issue after software update.",
      location: "North clinic lobby",
      device: "Check-in kiosk",
      businessImpact: "Front-desk queue friction with manual fallback available."
    },
    {
      id: "LKR-77",
      title: "Package locker door sensor mismatch",
      text: "Locker bank 77 shows door sensor mismatch on bay 14. Customer reported no package visible. Local courier photo confirms package was moved to overflow shelf by staff. Door actuator responds slowly.",
      history: "First report for bay 14 this quarter.",
      location: "Retail parcel room",
      device: "Smart locker",
      businessImpact: "Delivery confidence risk; no payment or identity data in this demo note."
    }
  ];

  let selected = incidents[0];
  let auditTrail = ["Demo mode loaded with synthetic incident fixtures."];

  const list = document.querySelector("#incident-list");
  const textarea = document.querySelector("#incident-text");
  const classify = document.querySelector("#classify");
  const output = document.querySelector("#output");

  function scoreIncident(text) {
    const lower = text.toLowerCase();
    let score = 25;
    if (lower.includes("failed") || lower.includes("jam") || lower.includes("frozen")) score += 22;
    if (lower.includes("twice") || lower.includes("repeated") || lower.includes("recurrence")) score += 20;
    if (lower.includes("payment") || lower.includes("funds")) score += 8;
    if (lower.includes("manual") || lower.includes("monitor")) score -= 8;
    if (lower.includes("slow") || lower.includes("clears it for 20 minutes")) score += 10;
    const bounded = Math.max(10, Math.min(95, score));
    const severity = bounded >= 65 ? "high" : bounded >= 42 ? "medium" : "low";
    return { score: bounded, severity };
  }

  function classifyIncident(incident) {
    const text = textarea.value.trim() || incident.text;
    const result = scoreIncident(text);
    const lower = text.toLowerCase();
    const category = lower.includes("kiosk")
      ? "software stability"
      : lower.includes("locker") || lower.includes("sensor")
        ? "sensor or actuator"
        : "cash handling hardware";
    const repeated = lower.includes("twice") || lower.includes("repeated") || lower.includes("again");
    const recommendation = result.severity === "high"
      ? "Send technician with relevant replacement kit and review recent service history before route lock."
      : result.severity === "medium"
        ? "Schedule next available technician and ask site staff to capture the current error state."
        : "Monitor remotely, keep fallback workflow available, and dispatch only if the issue repeats.";
    return { text, result, category, repeated, recommendation };
  }

  function renderQueue() {
    list.innerHTML = incidents.map((incident) => `
      <button type="button" data-id="${incident.id}" aria-pressed="${incident.id === selected.id}">
        ${incident.id}: ${incident.title}
      </button>
    `).join("");
  }

  function renderOutput() {
    const analysis = classifyIncident(selected);
    output.innerHTML = `
      <div class="output-grid">
        <article class="output-block">
          <h3>Classification</h3>
          <p><span class="severity ${analysis.result.severity}">${analysis.result.severity.toUpperCase()}</span></p>
          <p><strong>Category:</strong> ${analysis.category}</p>
          <p><strong>Device:</strong> ${selected.device}</p>
          <p><strong>Location:</strong> ${selected.location}</p>
        </article>
        <article class="output-block">
          <h3>Severity Score</h3>
          <div class="meter" aria-label="Severity score ${analysis.result.score} of 100">
            <span style="width:${analysis.result.score}%"></span>
          </div>
          <p>${analysis.result.score}/100 based on impact language, recurrence, and fallback availability.</p>
        </article>
        <article class="output-block">
          <h3>Repeated-Failure Signal</h3>
          <p>${analysis.repeated ? "Watch triggered: note suggests repeated or recurring behavior." : "No repeated-failure threshold identified yet."}</p>
          <p>${selected.history}</p>
        </article>
        <article class="output-block">
          <h3>Business Context</h3>
          <p>${selected.businessImpact}</p>
        </article>
        <article class="output-block wide">
          <h3>Dispatch Recommendation</h3>
          <p>${analysis.recommendation}</p>
          <div class="button-row">
            <button type="button" id="approve">Approve dispatch plan</button>
            <button type="button" id="reject" class="secondary">Send back for context</button>
          </div>
        </article>
        <article class="output-block wide">
          <h3>Audit Trail</h3>
          <ol class="audit-list">
            ${auditTrail.map((item) => `<li>${item}</li>`).join("")}
          </ol>
        </article>
      </div>
    `;
  }

  function selectIncident(id) {
    selected = incidents.find((incident) => incident.id === id) || incidents[0];
    textarea.value = selected.text;
    auditTrail = auditTrail.concat(`Loaded ${selected.id} from synthetic queue.`);
    renderQueue();
    renderOutput();
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (button) selectIncident(button.dataset.id);
  });

  classify.addEventListener("click", () => {
    auditTrail = auditTrail.concat("Classification run completed.", "Coordinator review required before dispatch.");
    renderOutput();
  });

  output.addEventListener("click", (event) => {
    if (event.target.id === "approve") {
      auditTrail = auditTrail.concat("Dispatch recommendation approved by human reviewer.");
      renderOutput();
    }
    if (event.target.id === "reject") {
      auditTrail = auditTrail.concat("Recommendation returned for more context.");
      renderOutput();
    }
  });

  textarea.value = selected.text;
  renderQueue();
  renderOutput();
})();

