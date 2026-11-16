import './style.css'

type ThemeMode = 'light' | 'dark'
type EmailClassification = 'ASSISTANT_TO_REPLY' | 'CLIENT_TO_REPLY' | 'NO_REPLY_NEEDED' | 'NEEDS_REVIEW'
type EmailPriority = 'HIGH' | 'MEDIUM' | 'LOW'
type SegmentKey =
  | 'all'
  | 'assistant_to_reply'
  | 'client_to_reply'
  | 'no_reply_needed'
  | 'needs_review'
  | 'important'
  | 'action_required'
  | 'waiting_for_response'
  | 'meetings'
  | 'archived'

type EmailThreadMessage = {
  sender: string
  email: string
  role: 'assistant' | 'client' | 'external'
  timestamp: string
  body: string
}

type EmailItem = {
  id: string
  client: string
  sender: string
  email: string
  subject: string
  preview: string
  classification: EmailClassification
  priority: EmailPriority
  unread: boolean
  important: boolean
  attachments: number
  time: string
  date: string
  summary: string
  reason: string
  action: string
  confidence: number
  thread: EmailThreadMessage[]
}

type AccountStatus = 'connected' | 'syncing' | 'failed'

type AccountItem = {
  provider: 'Gmail' | 'Outlook / Microsoft 365'
  address: string
  status: AccountStatus
  lastSynced: string
  syncFrequency: string
}

type ClientAction = {
  id: string
  label: string
  detail: string
  time: string
}

const STORAGE_KEY = 'mailpilot-theme'

const emailData: EmailItem[] = [
  {
    id: 'email-1',
    client: 'Kensington Advisory',
    sender: 'Alicia Chen',
    email: 'alicia@kensingtonadvisory.com',
    subject: 'Contract approval request for Q4 engagement',
    preview: 'Can you confirm whether we should proceed with the revised scope...',
    classification: 'CLIENT_TO_REPLY',
    priority: 'HIGH',
    unread: true,
    important: true,
    attachments: 2,
    time: '9:42 AM',
    date: 'Today',
    summary: 'Alicia is requesting executive approval for the revised Q4 contract and asks for a decision this week.',
    reason: 'The sender is asking for a client authorization decision and the conversation includes contract terms that require personal review.',
    action: 'Review the contract and approve or request changes.',
    confidence: 94,
    thread: [
      {
        sender: 'Alicia Chen',
        email: 'alicia@kensingtonadvisory.com',
        role: 'external',
        timestamp: '9:12 AM',
        body: 'Hi Ava, I have attached the revised Q4 engagement agreement. The partner wants a final approval by Thursday. Could you confirm whether we should move ahead with the revised scope and pricing?'
      },
      {
        sender: 'Ava Peters',
        email: 'ava@aivoya.co',
        role: 'assistant',
        timestamp: '9:26 AM',
        body: 'Happy to review it. I will summarize the changes and flag anything that needs your approval before I send it over.'
      }
    ]
  },
  {
    id: 'email-2',
    client: 'Northstar Labs',
    sender: 'Mia Torres',
    email: 'mia@northstarlabs.com',
    subject: 'Can we reschedule the design review?',
    preview: 'Tuesday morning will not work for the team. Could we move it to Thursday afternoon?',
    classification: 'ASSISTANT_TO_REPLY',
    priority: 'MEDIUM',
    unread: false,
    important: true,
    attachments: 0,
    time: '8:18 AM',
    date: 'Today',
    summary: 'The design team is rescheduling a review and needs a quick assistant response to coordinate calendar options.',
    reason: 'This is a scheduling coordination request and does not require the client to decide anything.',
    action: 'Coordinate a new meeting slot and confirm availability.',
    confidence: 91,
    thread: [
      {
        sender: 'Mia Torres',
        email: 'mia@northstarlabs.com',
        role: 'external',
        timestamp: '8:00 AM',
        body: 'Hi team, Tuesday morning no longer works for us. Could we shift the design review to Thursday afternoon instead?'
      }
    ]
  },
  {
    id: 'email-3',
    client: 'Cedar & Co.',
    sender: 'Marketing Weekly',
    email: 'newsletter@cedarandco.com',
    subject: 'This week’s market notes and signals',
    preview: 'The latest industry snapshot is now live, including policy updates and hiring trends.',
    classification: 'NO_REPLY_NEEDED',
    priority: 'LOW',
    unread: false,
    important: false,
    attachments: 1,
    time: 'Yesterday',
    date: 'Yesterday',
    summary: 'The latest industry brief is informational and does not require action or a reply.',
    reason: 'The email is a newsletter-style update with no direct request or decision to make.',
    action: 'Archive or leave in the read queue.',
    confidence: 96,
    thread: [
      {
        sender: 'Marketing Weekly',
        email: 'newsletter@cedarandco.com',
        role: 'external',
        timestamp: 'Yesterday, 6:40 PM',
        body: 'Here are the latest market notes, policy changes, and hiring trends from across the sector.'
      }
    ]
  },
  {
    id: 'email-4',
    client: 'Aster Finance',
    sender: 'Harper Wells',
    email: 'harper@asterfinance.com',
    subject: 'Updated business proposal for 2027 roadmap',
    preview: 'I have revised the roadmap budget and key milestones based on your earlier comments.',
    classification: 'CLIENT_TO_REPLY',
    priority: 'HIGH',
    unread: true,
    important: true,
    attachments: 3,
    time: 'Mon',
    date: 'Monday',
    summary: 'A revised proposal with updated budgeting and milestones requires client review before the next planning cycle.',
    reason: 'The sender is seeking feedback and approval on a strategic proposal that affects the client’s decision-making.',
    action: 'Review the revised budget and approve or request edits.',
    confidence: 93,
    thread: [
      {
        sender: 'Harper Wells',
        email: 'harper@asterfinance.com',
        role: 'external',
        timestamp: 'Mon, 3:10 PM',
        body: 'Thanks again for the conversation this morning. I’ve revised the business proposal to reflect the discussion and the updated milestones below.'
      }
    ]
  },
  {
    id: 'email-5',
    client: 'Blue Finch Media',
    sender: 'Olivia Ramirez',
    email: 'olivia@bluefinchmedia.com',
    subject: 'Travel booking confirmation for client summit',
    preview: 'Your flights and hotel are confirmed. Please let me know if you need any changes.',
    classification: 'NO_REPLY_NEEDED',
    priority: 'LOW',
    unread: false,
    important: false,
    attachments: 1,
    time: 'Sun',
    date: 'Sunday',
    summary: 'A travel confirmation was sent and no additional action is needed unless the client decides to change the booking.',
    reason: 'This is an informational confirmation without a request for response or approval.',
    action: 'Leave as read and archive later if desired.',
    confidence: 97,
    thread: [
      {
        sender: 'Olivia Ramirez',
        email: 'olivia@bluefinchmedia.com',
        role: 'external',
        timestamp: 'Sun, 8:20 PM',
        body: 'Your hotel and flights for the summit are confirmed. I have also shared the itinerary in the attachment.'
      }
    ]
  },
  {
    id: 'email-6',
    client: 'Summit Growth',
    sender: 'Priya Shah',
    email: 'priya@summitgrowth.com',
    subject: 'Partnership opportunity with Meridian Labs',
    preview: 'We should review the proposed structure before the call on Friday morning.',
    classification: 'CLIENT_TO_REPLY',
    priority: 'HIGH',
    unread: true,
    important: true,
    attachments: 0,
    time: '8:27 AM',
    date: 'Today',
    summary: 'Priya is sharing a strategic partnership opportunity that requires a client decision before the Friday discussion.',
    reason: 'The request includes a business opportunity and direct decision-making context relevant to the client.',
    action: 'Assess the partnership terms and decide whether to proceed or request revisions.',
    confidence: 92,
    thread: [
      {
        sender: 'Priya Shah',
        email: 'priya@summitgrowth.com',
        role: 'external',
        timestamp: '8:14 AM',
        body: 'I have a promising collaboration lead with Meridian Labs. Can we review the proposed structure before Friday morning so we can decide quickly?'
      }
    ]
  },
  {
    id: 'email-7',
    client: 'Luma Ventures',
    sender: 'Jacob Lee',
    email: 'jacob@lumaventures.com',
    subject: 'Invoice payment reminder for design retainer',
    preview: 'The payment for the last invoice is still outstanding. Could you confirm the timing?',
    classification: 'NEEDS_REVIEW',
    priority: 'MEDIUM',
    unread: true,
    important: false,
    attachments: 0,
    time: 'Yesterday',
    date: 'Yesterday',
    summary: 'The invoice reminder is ambiguous because the payment is not clearly assigned to the assistant or the client yet.',
    reason: 'The email raises a payment question but the responsibility and due date need a quick review before classification is finalized.',
    action: 'Review billing status and confirm whether the client or assistant should follow up.',
    confidence: 68,
    thread: [
      {
        sender: 'Jacob Lee',
        email: 'jacob@lumaventures.com',
        role: 'external',
        timestamp: 'Yesterday, 4:44 PM',
        body: 'Hi there, I am following up on the design retainer invoice. Can you confirm when payment will be sent?'
      }
    ]
  },
  {
    id: 'email-8',
    client: 'Harbor One',
    sender: 'Riley Gomez',
    email: 'riley@harborone.com',
    subject: 'Quarterly status update and roadmap snapshot',
    preview: 'Our team has wrapped up the operating review and attached the latest status deck.',
    classification: 'NO_REPLY_NEEDED',
    priority: 'LOW',
    unread: false,
    important: false,
    attachments: 1,
    time: 'Tue',
    date: 'Tuesday',
    summary: 'This is a status update without a request for a response and no direct decision is required.',
    reason: 'The overview is informational and not tied to a response request or approval cycle.',
    action: 'Archive after review.',
    confidence: 96,
    thread: [
      {
        sender: 'Riley Gomez',
        email: 'riley@harborone.com',
        role: 'external',
        timestamp: 'Tue, 11:05 AM',
        body: 'I have attached the latest quarterly update, including the roadmap snapshot and the operating review highlights.'
      }
    ]
  },
  {
    id: 'email-9',
    client: 'Velora Studio',
    sender: 'Daniel Price',
    email: 'daniel@velorastudio.com',
    subject: 'Meeting confirmation for launch review',
    preview: 'We can meet on Wednesday at 10:00 AM. Please confirm if that works for your side.',
    classification: 'ASSISTANT_TO_REPLY',
    priority: 'MEDIUM',
    unread: false,
    important: false,
    attachments: 0,
    time: 'Tue',
    date: 'Tuesday',
    summary: 'This is a simple calendar confirmation that needs the assistant to confirm availability and coordinate the meeting.',
    reason: 'The email seeks a scheduling answer rather than a client decision, so the assistant should handle it directly.',
    action: 'Confirm the launch review time and send the calendar invite.',
    confidence: 90,
    thread: [
      {
        sender: 'Daniel Price',
        email: 'daniel@velorastudio.com',
        role: 'external',
        timestamp: 'Tue, 9:50 AM',
        body: 'Thanks for the opportunity to review the launch plan. We can meet at 10:00 AM on Wednesday if that works for you.'
      }
    ]
  },
  {
    id: 'email-10',
    client: 'Fable Works',
    sender: 'Sophie Walsh',
    email: 'sophie@fableworks.com',
    subject: 'Follow-up on the revised onboarding brief',
    preview: 'Are we comfortable with the revised deliverable timeline, or should I adjust it?',
    classification: 'CLIENT_TO_REPLY',
    priority: 'MEDIUM',
    unread: false,
    important: false,
    attachments: 0,
    time: 'Mon',
    date: 'Monday',
    summary: 'The client needs to confirm the revised onboarding brief and timeline before work can move forward.',
    reason: 'The message explicitly asks for a client decision about timeline changes and project direction.',
    action: 'Review the revised onboarding plan and confirm the final direction.',
    confidence: 88,
    thread: [
      {
        sender: 'Sophie Walsh',
        email: 'sophie@fableworks.com',
        role: 'external',
        timestamp: 'Mon, 1:48 PM',
        body: 'I have revised the onboarding brief and timeline. Are we comfortable with the updated delivery plan or should we adjust the remaining milestones?'
      }
    ]
  },
  {
    id: 'email-11',
    client: 'Westline Capital',
    sender: 'Ari Patel',
    email: 'ari@westlinecapital.com',
    subject: 'New board materials are ready for review',
    preview: 'The deck and supporting materials are attached for your final review before tomorrow’s session.',
    classification: 'CLIENT_TO_REPLY',
    priority: 'HIGH',
    unread: true,
    important: true,
    attachments: 2,
    time: '7:36 AM',
    date: 'Today',
    summary: 'The board deck requires client review and approval before tomorrow’s session and needs a decision soon.',
    reason: 'The sender is asking for final review and sign-off before the client-facing board presentation.',
    action: 'Review the materials and approve or request revisions before tomorrow.',
    confidence: 95,
    thread: [
      {
        sender: 'Ari Patel',
        email: 'ari@westlinecapital.com',
        role: 'external',
        timestamp: '7:15 AM',
        body: 'I have attached the final board materials and the updated analysis. Please review before the morning session and let me know if you want any final edits.'
      }
    ]
  },
  {
    id: 'email-12',
    client: 'Aster Finance',
    sender: 'Taylor Morgan',
    email: 'taylor@morganadvisory.com',
    subject: 'Reschedule our strategy call to next week',
    preview: 'I’m traveling and would appreciate moving the call to Tuesday, 2:00 PM if that works.',
    classification: 'ASSISTANT_TO_REPLY',
    priority: 'LOW',
    unread: false,
    important: false,
    attachments: 0,
    time: 'Wed',
    date: 'Wednesday',
    summary: 'This is a routine rescheduling request and can be handled by the assistant with a quick availability update.',
    reason: 'The email is a scheduling coordination request that does not require a client decision.',
    action: 'Offer a revised meeting time and send a calendar update.',
    confidence: 92,
    thread: [
      {
        sender: 'Taylor Morgan',
        email: 'taylor@morganadvisory.com',
        role: 'external',
        timestamp: 'Wed, 10:28 AM',
        body: 'I am traveling next week and would appreciate moving the strategy call to Tuesday, 2:00 PM. Please let me know if that works.'
      }
    ]
  }
]

const connectedAccounts: AccountItem[] = [
  {
    provider: 'Gmail',
    address: 'ava@aivoya.co',
    status: 'connected',
    lastSynced: '2 minutes ago',
    syncFrequency: 'Every 5 minutes'
  },
  {
    provider: 'Outlook / Microsoft 365',
    address: 'ava@northstarfinance.com',
    status: 'syncing',
    lastSynced: 'Syncing now',
    syncFrequency: 'Every 15 minutes'
  },
  {
    provider: 'Gmail',
    address: 'team@kensingtonadvisory.com',
    status: 'failed',
    lastSynced: 'Connection failed',
    syncFrequency: 'Manual retry'
  }
]

const clientActions: ClientAction[] = [
  {
    id: 'a-1',
    label: 'Client approved the revised contract',
    detail: 'Kensington Advisory updated the approval status and marked the contract as ready for final review.',
    time: '12 min ago'
  },
  {
    id: 'a-2',
    label: 'Potential partnership reviewed',
    detail: 'Summit Growth flagged the proposed structure and is waiting for the assistant to prepare the next draft.',
    time: '1 hour ago'
  },
  {
    id: 'a-3',
    label: 'Board materials were reassigned',
    detail: 'Westline Capital asked the assistant to take over the final review before tomorrow’s session.',
    time: 'Today'
  }
]

const promptSuggestions = [
  'Which emails need my attention today?',
  'Which emails require the client response?',
  'Summarize this thread and suggest next steps.',
  'What deadlines are coming up this week?'
]

type AppState = {
  theme: ThemeMode
  currentView: 'login' | 'signup' | 'onboarding' | 'assistant' | 'client' | 'accounts' | 'settings'
  segment: SegmentKey
  selectedEmailId: string
  searchTerm: string
  showReason: boolean
  replyComposerOpen: boolean
  draftBody: string
  chatInput: string
  chatHistory: Array<{ role: 'bot' | 'user'; text: string }>
}

const state: AppState = {
  theme: localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light',
  currentView: 'login',
  segment: 'all',
  selectedEmailId: 'email-1',
  searchTerm: '',
  showReason: false,
  replyComposerOpen: false,
  draftBody: 'Hi Alicia,\n\nThanks for the update. I’ve reviewed the thread and will be coordinating next steps with the relevant stakeholders.\n\nBest,\nAva',
  chatInput: '',
  chatHistory: [
    {
      role: 'bot',
      text: 'You have 4 emails needing action today. I would prioritize the contract approval, board deck review, and partnership opportunity before the Friday deadlines.'
    }
  ]
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
}

function getSegmentCounts(): Record<SegmentKey, number> {
  const counts: Record<SegmentKey, number> = {
    all: emailData.length,
    assistant_to_reply: emailData.filter((email) => email.classification === 'ASSISTANT_TO_REPLY').length,
    client_to_reply: emailData.filter((email) => email.classification === 'CLIENT_TO_REPLY').length,
    no_reply_needed: emailData.filter((email) => email.classification === 'NO_REPLY_NEEDED').length,
    needs_review: emailData.filter((email) => email.classification === 'NEEDS_REVIEW').length,
    important: emailData.filter((email) => email.important).length,
    action_required: emailData.filter((email) => email.classification !== 'NO_REPLY_NEEDED').length,
    waiting_for_response: emailData.filter((email) => email.classification === 'CLIENT_TO_REPLY' || email.classification === 'ASSISTANT_TO_REPLY').length,
    meetings: emailData.filter((email) => /meeting|review|call|schedule/i.test(email.subject)).length,
    archived: 3
  }

  return counts
}

function getVisibleEmails(): EmailItem[] {
  const query = state.searchTerm.trim().toLowerCase()

  return emailData.filter((email) => {
    const matchesSegment =
      state.segment === 'all' ||
      (state.segment === 'assistant_to_reply' && email.classification === 'ASSISTANT_TO_REPLY') ||
      (state.segment === 'client_to_reply' && email.classification === 'CLIENT_TO_REPLY') ||
      (state.segment === 'no_reply_needed' && email.classification === 'NO_REPLY_NEEDED') ||
      (state.segment === 'needs_review' && email.classification === 'NEEDS_REVIEW') ||
      (state.segment === 'important' && email.important) ||
      (state.segment === 'action_required' && email.classification !== 'NO_REPLY_NEEDED') ||
      (state.segment === 'waiting_for_response' && ['CLIENT_TO_REPLY', 'ASSISTANT_TO_REPLY'].includes(email.classification)) ||
      (state.segment === 'meetings' && /meeting|review|call|schedule/i.test(email.subject)) ||
      (state.segment === 'archived' && !email.unread)

    const matchesQuery =
      !query ||
      email.sender.toLowerCase().includes(query) ||
      email.subject.toLowerCase().includes(query) ||
      email.preview.toLowerCase().includes(query) ||
      email.client.toLowerCase().includes(query)

    return matchesSegment && matchesQuery
  })
}

function getSelectedEmail(): EmailItem | undefined {
  return emailData.find((email) => email.id === state.selectedEmailId) ?? emailData[0]
}

function getClassificationLabel(classification: EmailClassification): string {
  switch (classification) {
    case 'ASSISTANT_TO_REPLY':
      return 'Assistant to Reply'
    case 'CLIENT_TO_REPLY':
      return 'Client to Reply'
    case 'NO_REPLY_NEEDED':
      return 'No Reply Needed'
    case 'NEEDS_REVIEW':
      return 'Needs Review'
    default:
      return 'Unknown'
  }
}

function getClassificationTone(classification: EmailClassification): string {
  switch (classification) {
    case 'ASSISTANT_TO_REPLY':
      return 'classification-blue'
    case 'CLIENT_TO_REPLY':
      return 'classification-orange'
    case 'NO_REPLY_NEEDED':
      return 'classification-gray'
    case 'NEEDS_REVIEW':
      return 'classification-purple'
    default:
      return 'classification-gray'
  }
}

function buildMetrics(): Array<{ label: string; value: string; note: string }> {
  const total = emailData.length
  const unread = emailData.filter((email) => email.unread).length
  const assistantActions = emailData.filter((email) => email.classification === 'ASSISTANT_TO_REPLY').length
  const clientAttention = emailData.filter((email) => email.classification === 'CLIENT_TO_REPLY').length
  const waiting = emailData.filter((email) => email.classification === 'CLIENT_TO_REPLY' || email.classification === 'ASSISTANT_TO_REPLY').length

  return [
    { label: 'Total Emails', value: total.toString(), note: '+8.4% vs last week' },
    { label: 'Unread Emails', value: unread.toString(), note: '11 new this morning' },
    { label: 'Assistant Actions', value: assistantActions.toString(), note: '3 need follow-up' },
    { label: 'Client Attention', value: clientAttention.toString(), note: '2 urgent decisions' },
    { label: 'Waiting for Response', value: waiting.toString(), note: '6 pending follow-ups' }
  ]
}

function renderAuthScreen(): string {
  return `
    <div class="auth-shell">
      <aside class="auth-hero">
        <div class="brand-row">
          <div class="brand-mark">M</div>
          <span>MailPilot</span>
        </div>
        <div class="hero-copy">
          <div class="eyebrow">AI-Powered Executive Inbox</div>
          <h1>Keep your clients informed without drowning in email.</h1>
          <p>Cut through incoming noise, understand priority, and coordinate response ownership across every inbox.</p>
        </div>
        <div class="hero-points">
          <div><strong>4.8x</strong><span>faster triage</span></div>
          <div><strong>97%</strong><span>response confidence</span></div>
          <div><strong>24/7</strong><span>AI coverage</span></div>
        </div>
      </aside>
      <main class="auth-panel">
        <div class="auth-card">
          <div class="auth-header">
            <div>
              <div class="eyebrow">Welcome back</div>
              <h2>Sign in to MailPilot</h2>
            </div>
            <button class="ghost-button" data-action="switch-signup">Create account</button>
          </div>
          <form class="auth-form">
            <label>
              <span>Email</span>
              <input type="email" value="ava@aivoya.co" />
            </label>
            <label>
              <span>Password</span>
              <div class="password-wrap">
                <input type="password" value="password123" />
                <button type="button" class="icon-button" aria-label="Toggle password visibility">Show</button>
              </div>
            </label>
            <div class="auth-row">
              <label class="checkbox-line"><input type="checkbox" checked /> Remember me</label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="button" class="primary-button" data-action="login">Sign in</button>
            <button type="button" class="secondary-button" data-action="oauth-demo">
              <span class="google-mark">G</span> Continue with Google
            </button>
          </form>
        </div>
      </main>
    </div>
  `
}

function renderSignupScreen(): string {
  return `
    <div class="auth-shell">
      <aside class="auth-hero">
        <div class="brand-row">
          <div class="brand-mark">M</div>
          <span>MailPilot</span>
        </div>
        <div class="hero-copy">
          <div class="eyebrow">Launch your workspace</div>
          <h1>Set up your client and assistant operations in minutes.</h1>
          <p>Bring your inboxes, clients, and decision support into one premium assistant workspace.</p>
        </div>
      </aside>
      <main class="auth-panel">
        <div class="auth-card large-card">
          <div class="auth-header">
            <div>
              <div class="eyebrow">Create account</div>
              <h2>Start with MailPilot</h2>
            </div>
            <button class="ghost-button" data-action="switch-login">Sign in</button>
          </div>
          <form class="auth-form signup-form">
            <div class="two-up">
              <label><span>Full name</span><input value="Ava Peters" /></label>
              <label><span>Work email</span><input type="email" value="ava@aivoya.co" /></label>
            </div>
            <div class="two-up">
              <label><span>Password</span><input type="password" value="password123" /></label>
              <label><span>Confirm password</span><input type="password" value="password123" /></label>
            </div>
            <label><span>Role</span>
              <select>
                <option selected>Personal Assistant</option>
                <option>Client</option>
              </select>
            </label>
            <button type="button" class="primary-button" data-action="create-account">Create account</button>
          </form>
        </div>
      </main>
    </div>
  `
}

function renderOnboardingScreen(): string {
  return `
    <div class="onboarding-shell">
      <div class="onboarding-card">
        <div class="onboarding-header">
          <div class="eyebrow">Setup Wizard</div>
          <h2>Welcome to MailPilot</h2>
        </div>
        <div class="wizard-steps">
          <div class="wizard-step current">
            <span class="step-index">1</span>
            <div>
              <strong>Welcome</strong>
              <p>Set up your workspace</p>
            </div>
          </div>
          <div class="wizard-step">
            <span class="step-index">2</span>
            <div>
              <strong>Choose workspace</strong>
              <p>Assistant or client view</p>
            </div>
          </div>
          <div class="wizard-step">
            <span class="step-index">3</span>
            <div>
              <strong>Connect inbox</strong>
              <p>Gmail or Outlook</p>
            </div>
          </div>
          <div class="wizard-step">
            <span class="step-index">4</span>
            <div>
              <strong>Sync data</strong>
              <p>Client and account details</p>
            </div>
          </div>
        </div>
        <div class="onboarding-panel">
          <div class="workspace-option selected">
            <div>
              <div class="eyebrow">Workspace type</div>
              <h3>Personal Assistant</h3>
            </div>
            <span class="option-tag">Recommended</span>
          </div>
          <div class="workspace-option">
            <div>
              <div class="eyebrow">Workspace type</div>
              <h3>Client</h3>
            </div>
          </div>
        </div>
        <div class="sync-box">
          <div class="sync-meta">
            <div>
              <div class="eyebrow">Connected provider</div>
              <strong>Gmail</strong>
            </div>
            <span class="status-pill connected">Connected</span>
          </div>
          <div class="sync-progress">
            <div class="progress-bar"><span style="width: 82%"></span></div>
            <div class="progress-meta"><span>Connecting ava@aivoya.co</span><span>82% complete</span></div>
          </div>
        </div>
        <div class="onboarding-actions">
          <button class="ghost-button" data-action="switch-login">Back</button>
          <button class="primary-button" data-action="start-assistant">Continue</button>
        </div>
      </div>
    </div>
  `
}

function renderAssistantDashboard(): string {
  const metrics = buildMetrics()
  const recentActions = clientActions
  const visibleEmails = getVisibleEmails()
  const selectedEmail = getSelectedEmail()

  return `
    <div class="workspace-shell">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-row compact">
            <div class="brand-mark">M</div>
            <span>MailPilot</span>
          </div>
          <button class="icon-button" data-action="toggle-sidebar" aria-label="Toggle sidebar">☰</button>
        </div>
        <div class="nav-section">
          <div class="nav-label">Workspace</div>
          <button class="nav-item active" data-action="assistant-view"><span class="nav-icon">◎</span><span>Overview</span><span class="count-pill">24</span></button>
          <button class="nav-item" data-action="assistant-view"><span class="nav-icon">✉</span><span>All Emails</span><span class="count-pill">${getSegmentCounts().all}</span></button>
          <button class="nav-item" data-action="select-segment" data-segment="assistant_to_reply"><span class="nav-icon">↩</span><span>Assistant to Reply</span><span class="count-pill">${getSegmentCounts().assistant_to_reply}</span></button>
          <button class="nav-item" data-action="select-segment" data-segment="client_to_reply"><span class="nav-icon">⏱</span><span>Client to Reply</span><span class="count-pill">${getSegmentCounts().client_to_reply}</span></button>
          <button class="nav-item" data-action="select-segment" data-segment="no_reply_needed"><span class="nav-icon">✓</span><span>No Reply Needed</span><span class="count-pill">${getSegmentCounts().no_reply_needed}</span></button>
          <button class="nav-item" data-action="select-segment" data-segment="needs_review"><span class="nav-icon">⚑</span><span>Needs Review</span><span class="count-pill">${getSegmentCounts().needs_review}</span></button>
        </div>
        <div class="nav-section">
          <div class="nav-label">Organization</div>
          <button class="nav-item" data-action="select-segment" data-segment="important"><span class="nav-icon">★</span><span>Important</span><span class="count-pill">${getSegmentCounts().important}</span></button>
          <button class="nav-item" data-action="select-segment" data-segment="action_required"><span class="nav-icon">! </span><span>Action Required</span><span class="count-pill">${getSegmentCounts().action_required}</span></button>
          <button class="nav-item" data-action="select-segment" data-segment="waiting_for_response"><span class="nav-icon">⬢</span><span>Waiting for Response</span><span class="count-pill">${getSegmentCounts().waiting_for_response}</span></button>
          <button class="nav-item" data-action="select-segment" data-segment="meetings"><span class="nav-icon">◫</span><span>Meetings & Appointments</span><span class="count-pill">${getSegmentCounts().meetings}</span></button>
          <button class="nav-item" data-action="select-segment" data-segment="archived"><span class="nav-icon">▣</span><span>Archived</span><span class="count-pill">${getSegmentCounts().archived}</span></button>
        </div>
        <div class="nav-section management">
          <div class="nav-label">Management</div>
          <button class="nav-item" data-action="open-accounts"><span class="nav-icon">◌</span><span>Connected Accounts</span></button>
          <button class="nav-item" data-action="open-settings"><span class="nav-icon">⚙</span><span>Settings</span></button>
        </div>
      </aside>

      <main class="content-shell">
        <header class="topbar">
          <div class="workspace-switcher">
            <span class="switch-label">Workspace</span>
            <button class="workspace-pill" data-action="assistant-view">Ava’s Assistant Workspace</button>
          </div>
          <div class="topbar-actions">
            <div class="searchbox">
              <span>⌕</span>
              <input type="text" placeholder="Search conversations, clients, and subjects" value="${escapeHtml(state.searchTerm)}" data-action="search-input" />
            </div>
            <button class="icon-button" data-action="show-shortcut" aria-label="Shortcuts">⌘K</button>
            <button class="icon-button" data-action="toggle-theme" aria-label="Toggle theme">${state.theme === 'dark' ? '☀' : '☾'}</button>
            <button class="avatar-button" data-action="switch-client">RP</button>
          </div>
        </header>

        <section class="page-header">
          <div>
            <div class="eyebrow">Good morning, Ava</div>
            <h1>Here's what's happening across your clients' inboxes.</h1>
          </div>
          <button class="primary-button small-button" data-action="switch-client">Client View</button>
        </section>

        <section class="metrics-grid">
          ${metrics
            .map(
              (metric) => `
            <div class="metric-card">
              <div class="metric-label">${metric.label}</div>
              <div class="metric-value">${metric.value}</div>
              <div class="metric-note">${metric.note}</div>
            </div>
          `
            )
            .join('')}
        </section>

        <section class="recent-activity-box">
          <div class="section-label">Recent client activity</div>
          ${recentActions
            .map(
              (action) => `
                <div class="activity-row">
                  <span class="activity-dot"></span>
                  <div>
                    <strong>${action.label}</strong>
                    <p>${action.detail}</p>
                  </div>
                  <span class="activity-time">${action.time}</span>
                </div>
              `
            )
            .join('')}
        </section>

        <div class="mail-layout">
          <section class="mail-list-panel">
            <div class="list-header">
              <div>
                <div class="eyebrow">Priority inbox</div>
                <h2>Needs Your Attention</h2>
              </div>
              <div class="toolbar-row">
                <button class="ghost-button small-button" data-action="select-segment" data-segment="all">All</button>
                <button class="ghost-button small-button" data-action="select-segment" data-segment="assistant_to_reply">Assist</button>
                <button class="ghost-button small-button" data-action="select-segment" data-segment="client_to_reply">Client</button>
              </div>
            </div>

            <div class="segment-tabs">
              ${(
                ['all','assistant_to_reply','client_to_reply','no_reply_needed','needs_review'] as SegmentKey[]
              )
                .map((segment) => {
                  const labels: Record<SegmentKey, string> = {
                    all: 'All Emails',
                    assistant_to_reply: 'Assistant to Reply',
                    client_to_reply: 'Client to Reply',
                    no_reply_needed: 'No Reply Needed',
                    needs_review: 'Needs Review',
                    important: 'Important',
                    action_required: 'Action Required',
                    waiting_for_response: 'Waiting',
                    meetings: 'Meetings',
                    archived: 'Archived'
                  }

                  const selected = state.segment === segment ? 'selected' : ''
                  return `<button class="segment-button ${selected}" data-action="select-segment" data-segment="${segment}">${labels[segment]} <span>${getSegmentCounts()[segment]}</span></button>`
                })
                .join('')}
            </div>

            <div class="email-list">
              ${
                visibleEmails.length
                  ? visibleEmails
                      .map(
                        (email) => `
                        <button class="email-row ${email.id === selectedEmail?.id ? 'selected-row' : ''}" data-action="select-email" data-email-id="${email.id}">
                          <div class="avatar-circle">${getInitials(email.sender)}</div>
                          <div class="email-body">
                            <div class="email-headline">
                              <strong>${email.sender}</strong>
                              <span>${email.time}</span>
                            </div>
                            <div class="email-client">${email.client}</div>
                            <div class="email-subject">${email.subject}</div>
                            <div class="email-preview">${email.preview}</div>
                            <div class="row-meta">
                              <span class="classification-badge ${getClassificationTone(email.classification)}">${getClassificationLabel(email.classification)}</span>
                              ${email.priority === 'HIGH' ? '<span class="priority-mark high">High priority</span>' : ''}
                              ${email.attachments ? '<span class="meta-chip">📎 2</span>' : ''}
                              ${email.unread ? '<span class="meta-chip unread">Unread</span>' : ''}
                            </div>
                          </div>
                        </button>
                      `
                      )
                      .join('')
                  : '<div class="empty-state">No conversations match your current filter.</div>'
              }
            </div>
          </section>

          <aside class="detail-panel">
            ${selectedEmail ? renderConversationDetails(selectedEmail) : '<div class="empty-state">Select an email to review the thread.</div>'}
          </aside>
        </div>
      </main>
    </div>
  `
}

function renderConversationDetails(email: EmailItem): string {
  return `
    <div class="detail-header">
      <div class="detail-title-wrap">
        <button class="ghost-button small-button" data-action="select-segment" data-segment="all">Back to inbox</button>
        <h2>${email.subject}</h2>
      </div>
      <div class="detail-actions">
        <span class="classification-badge ${getClassificationTone(email.classification)}">${getClassificationLabel(email.classification)}</span>
        <button class="ghost-button small-button" data-action="toggle-important" data-email-id="${email.id}">${email.important ? '★ Important' : '☆ Mark important'}</button>
        <button class="ghost-button small-button" data-action="archive-email" data-email-id="${email.id}">Archive</button>
      </div>
    </div>

    <div class="thread-container">
      ${email.thread
        .map(
          (message) => `
          <div class="message-card ${message.role === 'assistant' ? 'assistant-message' : ''}">
            <div class="message-header">
              <div class="avatar-circle small-avatar">${getInitials(message.sender)}</div>
              <div>
                <strong>${message.sender}</strong>
                <div>${message.email}</div>
              </div>
              <span>${message.timestamp}</span>
            </div>
            <p>${message.body}</p>
          </div>
        `
        )
        .join('')}
    </div>

    <div class="analysis-box">
      <div class="analysis-header">
        <div>
          <div class="eyebrow">AI Intelligence</div>
          <h3>AI Summary</h3>
        </div>
        <button class="ghost-button small-button" data-action="toggle-reason">Why this classification?</button>
      </div>
      <p>${email.summary}</p>
      ${state.showReason ? `<div class="reason-panel"><strong>Why it matters:</strong> ${email.reason}<br /><strong>Recommended action:</strong> ${email.action}<br /><strong>Confidence:</strong> ${email.confidence}%</div>` : ''}
    </div>

    <div class="detail-actions-row">
      <button class="ghost-button small-button" data-action="mark-handled" data-email-id="${email.id}">Mark as handled</button>
      <button class="ghost-button small-button" data-action="assign-assistant" data-email-id="${email.id}">Assign to assistant</button>
      <button class="primary-button small-button" data-action="draft-reply" data-email-id="${email.id}">Draft Reply</button>
    </div>

    <div class="assistant-chat-panel">
      <div class="chat-header">
        <div class="eyebrow">AI Email Assistant</div>
        <h3>MailPilot</h3>
      </div>
      <div class="chat-messages">
        ${state.chatHistory
          .map(
            (message) => `
            <div class="chat-bubble ${message.role === 'bot' ? 'bot' : 'user'}">
              ${message.text}
            </div>
          `
          )
          .join('')}
      </div>
      <div class="prompt-chips">
        ${promptSuggestions
          .map(
            (prompt) => `
            <button class="chip-button" data-action="prompt-chip" data-prompt="${escapeHtml(prompt)}">${prompt}</button>
          `
          )
          .join('')}
      </div>
      <div class="chat-composer">
        <input type="text" value="${escapeHtml(state.chatInput)}" placeholder="Ask about this email thread" data-action="chat-input" />
        <button class="primary-button small-button" data-action="send-chat">Send</button>
      </div>
    </div>
  `
}

function renderClientDashboard(): string {
  const clientEmails = emailData.filter((email) => email.classification === 'CLIENT_TO_REPLY')
  const selectedEmail = clientEmails.find((email) => email.id === state.selectedEmailId) ?? clientEmails[0]

  return `
    <div class="client-shell">
      <header class="client-topbar">
        <div class="brand-row compact">
          <div class="brand-mark">M</div>
          <span>MailPilot</span>
        </div>
        <div class="client-profile">
          <span>Rachael Park</span>
          <button class="avatar-button" data-action="switch-assistant">RP</button>
          <button class="icon-button" data-action="toggle-theme" aria-label="Toggle theme">${state.theme === 'dark' ? '☀' : '☾'}</button>
        </div>
      </header>

      <main class="client-main">
        <section class="client-hero">
          <div>
            <div class="eyebrow">Your attention</div>
            <h1>Your assistant has organized the conversations that need your input.</h1>
          </div>
        </section>

        <section class="client-summary-grid">
          <div class="summary-card">
            <div class="summary-label">Pending decisions</div>
            <div class="summary-value">${clientEmails.length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Important requests</div>
            <div class="summary-value">${clientEmails.filter((email) => email.priority === 'HIGH').length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Upcoming deadlines</div>
            <div class="summary-value">4</div>
          </div>
        </section>

        <div class="client-layout">
          <section class="client-list-panel">
            ${
              clientEmails.length
                ? clientEmails
                    .map(
                      (email) => `
                        <button class="client-email-item ${email.id === selectedEmail?.id ? 'selected' : ''}" data-action="select-email" data-email-id="${email.id}">
                          <div class="client-email-top">
                            <strong>${email.sender}</strong>
                            <span>${email.date}</span>
                          </div>
                          <div class="client-email-subject">${email.subject}</div>
                          <div class="client-email-summary">${email.summary}</div>
                          <div class="client-email-footer">
                            <span class="priority-mark ${email.priority === 'HIGH' ? 'high' : 'medium'}">${email.priority}</span>
                            <span>${email.action}</span>
                          </div>
                        </button>
                      `
                    )
                    .join('')
                : `
                  <div class="empty-client-state">
                    <div class="empty-icon">✓</div>
                    <h3>You're all caught up.</h3>
                    <p>Your assistant and MailPilot are keeping an eye on your inbox.</p>
                  </div>
                `
            }
          </section>

          <aside class="client-detail-panel">
            ${selectedEmail ? `
              <div class="detail-card">
                <div class="eyebrow">Why your response is needed</div>
                <h2>${selectedEmail.subject}</h2>
                <p>${selectedEmail.summary}</p>
                <div class="client-detail-meta">
                  <span>Sender: ${selectedEmail.sender}</span>
                  <span>Priority: ${selectedEmail.priority}</span>
                  <span>Deadline: Friday 4:00 PM</span>
                </div>
                <div class="thread-preview">
                  ${selectedEmail.thread
                    .map(
                      (msg) => `
                        <div class="client-thread-item">
                          <strong>${msg.sender}</strong>
                          <p>${msg.body}</p>
                        </div>
                      `
                    )
                    .join('')}
                </div>
                <div class="client-actions-row">
                  <button class="primary-button" data-action="client-handled" data-email-id="${selectedEmail.id}">I’ll Handle This</button>
                  <button class="ghost-button" data-action="client-reassign" data-email-id="${selectedEmail.id}">Assistant, Please Handle</button>
                </div>
              </div>
            ` : '<div class="empty-state">No conversations need your attention right now.</div>'}
          </aside>
        </div>
      </main>
    </div>
  `
}

function renderAccountsPage(): string {
  return `
    <div class="settings-shell">
      <header class="topbar small-topbar">
        <div class="brand-row compact">
          <div class="brand-mark">M</div>
          <span>MailPilot</span>
        </div>
        <div class="topbar-actions">
          <button class="ghost-button" data-action="assistant-view">Back to dashboard</button>
          <button class="icon-button" data-action="toggle-theme" aria-label="Toggle theme">${state.theme === 'dark' ? '☀' : '☾'}</button>
        </div>
      </header>

      <main class="content-frame">
        <div class="page-header narrow-header">
          <div>
            <div class="eyebrow">Connected accounts</div>
            <h1>Manage inbox integrations</h1>
          </div>
        </div>

        <div class="accounts-grid">
          ${connectedAccounts
            .map(
              (account) => `
              <div class="account-card">
                <div class="account-header">
                  <div class="provider-logo">${account.provider === 'Gmail' ? 'G' : 'O'}</div>
                  <div>
                    <strong>${account.provider}</strong>
                    <div class="account-address">${account.address}</div>
                  </div>
                </div>
                <div class="account-meta-row">
                  <span class="status-pill ${account.status === 'connected' ? 'connected' : account.status === 'syncing' ? 'syncing' : 'failed'}">${account.status.toUpperCase()}</span>
                  <span>${account.lastSynced}</span>
                </div>
                <div class="account-detail">Sync frequency: ${account.syncFrequency}</div>
                <div class="account-actions">
                  <button class="ghost-button small-button" data-action="connect-account" data-provider="${account.provider}">Reconnect</button>
                  <button class="ghost-button small-button danger-button" data-action="disconnect-account" data-provider="${account.provider}">Disconnect</button>
                </div>
              </div>
            `
            )
            .join('')}
        </div>
      </main>
    </div>
  `
}

function renderSettingsPage(): string {
  return `
    <div class="settings-shell">
      <header class="topbar small-topbar">
        <div class="brand-row compact">
          <div class="brand-mark">M</div>
          <span>MailPilot</span>
        </div>
        <div class="topbar-actions">
          <button class="ghost-button" data-action="assistant-view">Back to dashboard</button>
          <button class="icon-button" data-action="toggle-theme" aria-label="Toggle theme">${state.theme === 'dark' ? '☀' : '☾'}</button>
        </div>
      </header>

      <main class="content-frame narrow-settings">
        <div class="page-header narrow-header">
          <div>
            <div class="eyebrow">Workspace settings</div>
            <h1>Configure your assistive preferences</h1>
          </div>
        </div>

        <div class="settings-grid">
          <div class="settings-card">
            <h3>Profile</h3>
            <label><span>Name</span><input value="Ava Peters" /></label>
            <label><span>Role</span><input value="Senior Personal Assistant" /></label>
          </div>
          <div class="settings-card">
            <h3>Theme Preference</h3>
            <label class="checkbox-line"><input type="checkbox" checked /> Use system preference</label>
            <label class="checkbox-line"><input type="checkbox" checked /> Save theme locally</label>
          </div>
          <div class="settings-card">
            <h3>AI confidence</h3>
            <label><span>Threshold</span><input value="70%" /></label>
            <label><span>Fallback mode</span><input value="Mock AI enabled" /></label>
          </div>
          <div class="settings-card">
            <h3>Notifications</h3>
            <label class="checkbox-line"><input type="checkbox" checked /> Weekly summary</label>
            <label class="checkbox-line"><input type="checkbox" checked /> Deadline reminders</label>
          </div>
        </div>
      </main>
    </div>
  `
}

function renderPage(): string {
  switch (state.currentView) {
    case 'signup':
      return renderSignupScreen()
    case 'onboarding':
      return renderOnboardingScreen()
    case 'assistant':
      return renderAssistantDashboard()
    case 'client':
      return renderClientDashboard()
    case 'accounts':
      return renderAccountsPage()
    case 'settings':
      return renderSettingsPage()
    case 'login':
    default:
      return renderAuthScreen()
  }
}

function render(): void {
  const app = document.querySelector('#app')
  if (!app) return

  app.innerHTML = renderPage()
  applyTheme(state.theme)
  bindInteractions()
}

function bindInteractions(): void {
  const app = document.querySelector('#app')
  if (!app) return

  const actionButtons = app.querySelectorAll('[data-action]')
  actionButtons.forEach((element) => {
    const action = element.getAttribute('data-action')

    if (!action) return

    element.addEventListener('click', () => {
      executeAction(action, element)
    })
  })

  const searchInput = app.querySelector('[data-action="search-input"]') as HTMLInputElement | null
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement
      state.searchTerm = target.value
      render()
    })
  }

  const chatInput = app.querySelector('[data-action="chat-input"]') as HTMLInputElement | null
  if (chatInput) {
    chatInput.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement
      state.chatInput = target.value
    })
  }
}

function executeAction(action: string, element: Element): void {
  switch (action) {
    case 'login':
      state.currentView = 'assistant'
      render()
      break
    case 'switch-signup':
      state.currentView = 'signup'
      render()
      break
    case 'switch-login':
      state.currentView = 'login'
      render()
      break
    case 'create-account':
      state.currentView = 'onboarding'
      render()
      break
    case 'start-assistant':
      state.currentView = 'assistant'
      render()
      break
    case 'assistant-view':
      state.currentView = 'assistant'
      render()
      break
    case 'switch-client':
      state.currentView = 'client'
      render()
      break
    case 'switch-assistant':
      state.currentView = 'assistant'
      render()
      break
    case 'select-segment': {
      const segment = element.getAttribute('data-segment') as SegmentKey | null
      if (segment) {
        state.segment = segment
        render()
      }
      break
    }
    case 'select-email': {
      const emailId = element.getAttribute('data-email-id')
      if (emailId) {
        state.selectedEmailId = emailId
        render()
      }
      break
    }
    case 'toggle-theme': {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      applyTheme(state.theme)
      render()
      break
    }
    case 'toggle-reason':
      state.showReason = !state.showReason
      render()
      break
    case 'draft-reply': {
      const email = getSelectedEmail()
      if (email) {
        state.replyComposerOpen = true
        state.draftBody = `Hi ${email.sender.split(' ')[0]},\n\nThanks for the update. I’ve reviewed the thread and will be coordinating next steps with the relevant stakeholders.\n\nBest,\nAva`
        render()
      }
      break
    }
    case 'mark-handled': {
      const email = getSelectedEmail()
      if (email) {
        email.classification = 'NO_REPLY_NEEDED'
        email.unread = false
        render()
      }
      break
    }
    case 'assign-assistant': {
      const email = getSelectedEmail()
      if (email) {
        email.classification = 'ASSISTANT_TO_REPLY'
        render()
      }
      break
    }
    case 'toggle-important': {
      const emailId = element.getAttribute('data-email-id')
      const email = emailData.find((item) => item.id === emailId)
      if (email) {
        email.important = !email.important
        render()
      }
      break
    }
    case 'archive-email': {
      const emailId = element.getAttribute('data-email-id')
      const email = emailData.find((item) => item.id === emailId)
      if (email) {
        email.classification = 'NO_REPLY_NEEDED'
        render()
      }
      break
    }
    case 'prompt-chip': {
      const prompt = element.getAttribute('data-prompt')
      if (prompt) {
        state.chatInput = prompt
        state.chatHistory.push({ role: 'user', text: prompt })
        state.chatHistory.push({ role: 'bot', text: 'I have identified 4 high-priority items that match your request, including the Q4 contract approval and the board deck review due tomorrow.' })
        render()
      }
      break
    }
    case 'send-chat': {
      const question = state.chatInput.trim()
      if (!question) return
      state.chatHistory.push({ role: 'user', text: question })
      state.chatHistory.push({ role: 'bot', text: 'I reviewed the active threads and found the most relevant items: the contract approval, board deck review, and partnership opportunity are the clearest priority items this morning.' })
      state.chatInput = ''
      render()
      break
    }
    case 'open-accounts':
      state.currentView = 'accounts'
      render()
      break
    case 'open-settings':
      state.currentView = 'settings'
      render()
      break
    case 'connect-account': {
      const provider = element.getAttribute('data-provider')
      if (provider) {
        state.currentView = 'accounts'
        render()
      }
      break
    }
    case 'disconnect-account': {
      const provider = element.getAttribute('data-provider')
      if (provider) {
        const account = connectedAccounts.find((item) => item.provider === provider)
        if (account) {
          account.status = 'failed'
          render()
        }
      }
      break
    }
    case 'client-handled': {
      const emailId = element.getAttribute('data-email-id')
      const email = emailData.find((item) => item.id === emailId)
      if (email) {
        email.classification = 'NO_REPLY_NEEDED'
        render()
      }
      break
    }
    case 'client-reassign': {
      const emailId = element.getAttribute('data-email-id')
      const email = emailData.find((item) => item.id === emailId)
      if (email) {
        email.classification = 'ASSISTANT_TO_REPLY'
        state.currentView = 'assistant'
        render()
      }
      break
    }
    case 'toggle-sidebar':
      const sidebar = document.querySelector('.sidebar')
      if (sidebar) {
        sidebar.classList.toggle('collapsed')
      }
      break
    default:
      break
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

applyTheme(state.theme)
render()
