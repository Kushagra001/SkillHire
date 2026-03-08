# n8n Workflow: Automated Job Distribution

**Purpose:** This document defines the complete n8n workflow for distributing newly scraped jobs from MongoDB to Telegram channels after each scraper pipeline run.

**Trigger:** GitHub Actions POSTs to `https://skillhire-n8n.onrender.com/webhook/job-distribution` after every scraper run.

---

## Workflow Architecture

```
Webhook Trigger (POST)
        ↓
MongoDB Query — fetch pending jobs
        ↓
IF statement — is_premium check
    ↓                    ↓
Premium Branch       Free Branch
    ↓                    ↓
Format Premium Msg   Format Free Msg
    ↓                    ↓
SplitInBatches (5)   SplitInBatches (5)
    ↓                    ↓
Telegram Send        Telegram Send
    ↓                    ↓
MongoDB Update       MongoDB Update
(distributed)        (distributed)
```

---

## Node-by-Node Setup

### Node 1 — Webhook

| Field | Value |
|---|---|
| HTTP Method | `POST` |
| Path | `job-distribution` |
| Authentication | None |
| Respond | Immediately |

**Full URL:** `https://skillhire-n8n.onrender.com/webhook/job-distribution`

---

### Node 2 — MongoDB Query (Fetch Pending Jobs)

**Node type:** `MongoDB`  
**Operation:** `Find`

| Field | Value |
|---|---|
| Collection | `jobs` |
| Query | `{ "distribution_status": "pending", "is_active": true }` |
| Limit | `50` |
| Projection | `{ "title": 1, "company": 1, "location": 1, "apply_link": 1, "is_premium": 1, "salary_status": 1 }` |

> **Credentials:** Use your MongoDB Atlas connection string (add as n8n credential of type `MongoDB`).

**Handle empty results:** Add an `IF` node after this to check `{{ $json.length > 0 }}`. If false, stop the workflow with a `NoOp` node.

---

### Node 3 — Split by Premium Status

**Node type:** `IF`  
**Condition:** `{{ $json.is_premium === true }}`

- **True branch** → Premium Telegram channel
- **False branch** → Free Telegram channel

---

### Node 4a — Format Premium Message

**Node type:** `Set`

Set a field `message` with the value:

```
🚀 {{ $json.title }} @ {{ $json.company }}

📍 {{ $json.location }}
💰 {{ $json.salary_status || 'Competitive CTC' }}

⚡ Premium Early Access — Apply before others!

👉 Apply Now
{{ $json.apply_link }}

#SkillHire #PremiumJobs #TechJobs
```

Also set `channel_name` = `telegram_premium`

---

### Node 4b — Format Free Message

**Node type:** `Set`

Set a field `message` with the value:

```
🔥 {{ $json.title }} @ {{ $json.company }}

📍 {{ $json.location }}
💰 {{ $json.salary_status || 'Competitive CTC' }}

📚 Crack the interview: [DSA + System Design Bundle](AFFILIATE_LINK)

👉 Apply Now
{{ $json.apply_link }}

💎 Premium members got this job 24h earlier!
👉 Upgrade at skillhire.in

#SkillHire #FresherJobs #TechJobs
```

Also set `channel_name` = `telegram_free`

---

### Node 5 — Batch Jobs (Rate Limit Protection)

**Node type:** `SplitInBatches`

| Field | Value |
|---|---|
| Batch Size | `5` |
| Options → Reset | `false` |

After sending each batch, add a **Wait** node:  
- **Duration:** `1` second

This prevents Telegram API rate-limit errors (30 messages/second limit).

---

### Node 6 — Send to Telegram

**Node type:** `Telegram`  
**Operation:** `Send Message`

| Field | Value |
|---|---|
| Chat ID | `{{ $json.channel_name === 'telegram_premium' ? '@SkillHirePremium' : '@SkillHireFree' }}` |
| Text | `{{ $json.message }}` |
| Parse Mode | `Markdown` |
| Disable Link Preview | `false` |

> **Credentials:** Add a Telegram Bot token as an n8n credential. Create a bot via [@BotFather](https://t.me/BotFather) and add the bot to both channels as Admin.

---

### Node 7 — Update MongoDB (Mark as Distributed)

**Node type:** `MongoDB`  
**Operation:** `Update`

| Field | Value |
|---|---|
| Collection | `jobs` |
| Filter | `{ "_id": { "$oid": "{{ $json._id }}" } }` |
| Update | See below |
| Upsert | `false` |

**Update payload:**
```json
{
  "$set": {
    "distribution_status": "distributed"
  },
  "$push": {
    "distributed_channels": "{{ $json.channel_name }}"
  }
}
```

---

## Error Handling

| Scenario | Handling |
|---|---|
| No pending jobs | `IF` node stops workflow silently (NoOp) |
| Telegram API rate limit | `SplitInBatches` + 1s `Wait` node prevents this |
| Telegram send failure | n8n auto-retry (set retry on error = 3 attempts) |
| MongoDB update failure | Log error via n8n `Error Trigger` workflow |
| Webhook called with no secret | Workflow runs safely — query returns 0 if nothing pending |

---

## Required n8n Credentials

| Credential | Type | Value |
|---|---|---|
| MongoDB Atlas | `MongoDB` | Your Atlas connection string from `MONGODB_URI` |
| Telegram Bot | `Telegram API` | Bot token from @BotFather |

---

## Future Channels (Expansion)

When adding WhatsApp / LinkedIn / Reddit:

1. After the `IF (is_premium)` split, add additional `IF` branches or a `Switch` node
2. Each new channel gets its own Format + Send + MongoDB Update chain
3. Update the `channel_name` values pushed to `distributed_channels` accordingly
4. The `distribution_status` field logic remains the same — marking as `"distributed"` after all channels are done

---

## Activation Checklist

- [ ] Deploy n8n on Render at `skillhire-n8n.onrender.com`
- [ ] Set up UptimeRobot to ping `https://skillhire-n8n.onrender.com` every 5 minutes
- [ ] Create Telegram bot via @BotFather
- [ ] Add bot as Admin to both `@SkillHirePremium` and `@SkillHireFree` channels
- [ ] Add MongoDB Atlas credential in n8n
- [ ] Add Telegram Bot credential in n8n
- [ ] Build the workflow as described above and **Activate** it
- [ ] Add GitHub secret `N8N_WEBHOOK_URL` = `https://skillhire-n8n.onrender.com/webhook/job-distribution`
- [ ] Test by manually running the GitHub Actions workflow (`workflow_dispatch`)
