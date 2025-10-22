import type { CommsState } from '../types';

export const mockCommsState: CommsState = {
  accounts: [
    {
      id: 'acc_1',
      name: 'Chris',
      email: 'chris.commander@astra.dev',
      folders: [
        { name: 'Inbox', unreadCount: 2 },
        { name: 'Sent', unreadCount: 0 },
        { name: 'Drafts', unreadCount: 0 },
        { name: 'Trash', unreadCount: 0 },
      ],
    },
    {
      id: 'acc_2',
      name: 'Project Dragonfly',
      email: 'dragonfly.prj@astra.dev',
      folders: [
        { name: 'Inbox', unreadCount: 1 },
        { name: 'Sent', unreadCount: 0 },
        { name: 'Drafts', unreadCount: 1 },
        { name: 'Trash', unreadCount: 0 },
      ],
    },
  ],
  emails: [
    {
      id: 'email_1',
      accountId: 'acc_1',
      folder: 'Inbox',
      from: { name: 'Vela', email: 'vela.dev@astra.dev' },
      to: [{ name: 'Chris', email: 'chris.commander@astra.dev' }],
      subject: 'Code Review for Task #418',
      body: `Commander,

I've pushed the latest commits for the authentication module. The core logic is in place, but I'd appreciate a second set of eyes on the token handling in 'authService.ts'.

Let me know your thoughts.

- Vela`,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isRead: false,
      labels: ['Urgent', 'Development'],
    },
    {
      id: 'email_2',
      accountId: 'acc_1',
      folder: 'Inbox',
      from: { name: 'System Alerts', email: 'no-reply@astra.system' },
      to: [{ name: 'Chris', email: 'chris.commander@astra.dev' }],
      subject: 'Weekly Performance Metrics',
      body: `Here is your summary for the week:

- Tasks Completed: 34
- Compute Units Used: 4,820
- System Uptime: 99.98%

No critical errors were reported.

Regards,
ASTRA System Monitor`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
      labels: ['Report'],
    },
    {
      id: 'email_3',
      accountId: 'acc_1',
      folder: 'Inbox',
      from: { name: 'Lyra', email: 'lyra.design@astra.dev' },
      to: [{ name: 'Chris', email: 'chris.commander@astra.dev' }],
      subject: 'New UI Mockups for Project Nova',
      body: `Hi Commander,

I've attached the latest mockups for the Project Nova dashboard. I tried to incorporate the "holographic" feel we discussed.

Looking forward to your feedback.

Best,
Lyra`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      labels: ['Design'],
    },
     {
      id: 'email_4',
      accountId: 'acc_2',
      folder: 'Inbox',
      from: { name: 'External Partner', email: 'contact@partnercorp.com' },
      to: [{ name: 'Project Dragonfly', email: 'dragonfly.prj@astra.dev' }],
      subject: 'Inquiry about API Integration',
      body: `Hello Dragonfly Team,

We're interested in integrating our service with your new API. Could you provide us with the preliminary documentation and an endpoint for our sandbox environment?

Thanks,
John Doe
Partner Corp`,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      labels: ['External'],
    },
     {
      id: 'email_5',
      accountId: 'acc_2',
      folder: 'Drafts',
      from: { name: 'Project Dragonfly', email: 'dragonfly.prj@astra.dev' },
      to: [{ name: 'Internal Team', email: 'team@astra.dev' }],
      subject: 'Q3 Planning Meeting',
      body: `Team,

Let's schedule our Q3 planning session for next week. Please provide your availability.`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      isRead: true,
      labels: [],
    },
     {
      id: 'email_6',
      accountId: 'acc_1',
      folder: 'Sent',
      from: { name: 'Chris', email: 'chris.commander@astra.dev' },
      to: [{ name: 'Orion', email: 'orion.pm@astra.dev' }],
      subject: 'Re: Mission Budget Approval',
      body: `Orion,

The budget for the next phase is approved. Proceed as planned.

- C`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      isRead: true,
      labels: [],
    },
  ],
  selectedAccountId: 'acc_1',
  selectedFolder: 'Inbox',
  selectedEmailId: null,
  isComposing: false,
  composeMode: 'new',
  composeFields: {
    to: '',
    subject: '',
    body: '',
  },
};
