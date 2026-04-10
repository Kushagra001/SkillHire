# n8n Workflow: Consolidated Automation Suite

**Purpose:** This document defines the fully integrated n8n master workflow for SkillHire, encompassing:
1. **Automated Job Distribution**: Pumping jobs from MongoDB to Telegram and Discord.
2. **Automated LinkedIn Workarounds**: Generating and forwarding LinkedIn content to Make.com listeners.

## Master Architecture

```
                                               (Cron 10:30 AM / 2 Days)
                                                          ↓
                                        [LinkedIn Organic Pipeline (OpenAI -> Make.com)]
                                                          ↓
                                                  (Make.com handles LinkedIn API Post)
```
```
(Daily 9:00 AM Cron)
         ↓
[MongoDB 24h Summary]  →  [Discord Internal Summary Webhook]
         ↓
[AI Content Gen]  →  [Generate OG Image]  →  [Make.com Job Pipeline]
```
```
Webhook Trigger (POST)
         ↓
MongoDB Query (Pending Jobs)
         ↓
IF is_premium check
    ↓                    ↓
Premium Branch       Free Branch
    ↓                    ↓
Format Msg           Format Msg + Affiliate
    ↓                    ↓
SplitInBatches (1)   SplitInBatches (1)
    ↓                    ↓
Wait 1s              Wait 1s
    ↓                    ↓
Telegram Send        Telegram Send
    ↓                    ↓
MongoDB Update       MongoDB Update
(distributed)        (distributed)
```

---

## 1. Automated Job Distribution

**Trigger:** `https://n8n.skillhire.in/webhook/job-distribution`

### The Delay Logic (MongoDB Node)
The MongoDB Query uses a complex `$or` statement to fetch pending jobs. 
*   **Premium Jobs**: Fetched immediately for `telegram_premium`.
*   **Premium Delay**: Fetched for `telegram_free` ONLY if 24 hours have passed since they were posted to the premium channel (`premium_posted_at < NOW - 24h`).
*   **Regular Jobs**: Fetched for `telegram_free`.

### Discord Replacement (Summary)
The previous "Send WhatsApp Email" node has been replaced by a direct `discord webhook` integration pointing to your community channel. 
-   **URL**: `https://discord.com/api/webhooks/...`
-   **Method**: `POST` -> JSON payload with `{ "content": "..." }`

---

## 2. Make.com LinkedIn Integration

Instead of dealing with native LinkedIn node constraints on n8n (API blocks/First-party restrictions), the workflow delegates the final API submission to Make.com Webhooks.

**Job Posting Pipeline (Daily)**
-   Builds Context -> Groq Llama Generates caption -> OG Image generation is cached.
-   HTTP POST to: `https://hook.eu1.make.com/m0h201rlug3e6t54asf4jkm5ncfmiwpb`

**Organic Audience Pipeline (Every 2 Days)**
-   Groq Llama Generates technical post -> Groq Generates Short Title -> OG Image created based on title.
-   HTTP POST to: `https://hook.eu1.make.com/vjf19g0id7rj09i2fklwqr5hj7mk75yu`

---

## Required n8n Credentials

| Credential | Type | Value |
|---|---|---|
| MongoDB Atlas | `MongoDB` | Connection URI. **Must whitelist Droplet IP: 165.22.214.124** |
| Telegram Bot | `Telegram API` | Bot token from @BotFather |
| Groq | `OpenAI` | Groq API Key (Override base URL to `https://api.groq.com/openai/v1`) |
| Instagram | `Meta Publisher`| Re-auth your professional account |

*(Discord and Make.com are HTTP nodes and do not require formal n8n credentials since the URLs contain the access keys).*
