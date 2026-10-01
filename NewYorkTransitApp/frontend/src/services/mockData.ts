import type { Alert } from '@/types'

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    title: 'A/C/E trains suspended between 59 St-Columbus Circle and High St',
    description:
      'Due to signal problems at Chambers St, A, C, and E train service is suspended between 59 St-Columbus Circle and High St Brooklyn. Customers should use the 1, 2, 3, or F train as an alternative.',
    severity: 'NO_SERVICE',
    status: 'ACTIVE',
    affectedLines: [
      { id: 'A', name: 'A', type: 'SUBWAY', color: '#0039A6', textColor: '#FFFFFF' },
      { id: 'C', name: 'C', type: 'SUBWAY', color: '#0039A6', textColor: '#FFFFFF' },
      { id: 'E', name: 'E', type: 'SUBWAY', color: '#0039A6', textColor: '#FFFFFF' },
    ],
    activePeriods: [
      { start: new Date(Date.now() - 3600000).toISOString(), end: null },
    ],
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'alert-002',
    title: '4/5/6 trains running with delays',
    description:
      'Northbound 4, 5, and 6 trains are running up to 15 minutes late due to an earlier incident at 125 St. Express service is not stopping at all local stations during this delay.',
    severity: 'SIGNIFICANT_DELAYS',
    status: 'ACTIVE',
    affectedLines: [
      { id: '4', name: '4', type: 'SUBWAY', color: '#00933C', textColor: '#FFFFFF' },
      { id: '5', name: '5', type: 'SUBWAY', color: '#00933C', textColor: '#FFFFFF' },
      { id: '6', name: '6', type: 'SUBWAY', color: '#00933C', textColor: '#FFFFFF' },
    ],
    activePeriods: [
      { start: new Date(Date.now() - 7200000).toISOString(), end: null },
    ],
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'alert-003',
    title: 'L train weekend service suspended for track maintenance',
    description:
      'L trains will not run between 8th Av and Broadway Junction this weekend (Sat–Sun 12:01 AM – 5 AM). Free shuttle buses will operate along 14th St. Customers can use the A/C/E, 1/2/3, and F/M trains for crosstown connections.',
    severity: 'PLANNED_WORK',
    status: 'UPCOMING',
    affectedLines: [
      { id: 'L', name: 'L', type: 'SUBWAY', color: '#A7A9AC', textColor: '#000000' },
    ],
    activePeriods: [
      {
        start: new Date(Date.now() + 86400000).toISOString(),
        end: new Date(Date.now() + 172800000).toISOString(),
      },
    ],
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'alert-004',
    title: 'N/Q/R/W service change at Atlantic Av–Barclays Ctr',
    description:
      'N and Q trains skip Atlantic Av–Barclays Ctr station in both directions on weekday evenings. R and W trains stop normally. Use the 2/3/4/5/B/D/Q at the station or walk from the nearby stops.',
    severity: 'SERVICE_CHANGE',
    status: 'ACTIVE',
    affectedLines: [
      { id: 'N', name: 'N', type: 'SUBWAY', color: '#FCCC0A', textColor: '#000000' },
      { id: 'Q', name: 'Q', type: 'SUBWAY', color: '#FCCC0A', textColor: '#000000' },
      { id: 'R', name: 'R', type: 'SUBWAY', color: '#FCCC0A', textColor: '#000000' },
      { id: 'W', name: 'W', type: 'SUBWAY', color: '#FCCC0A', textColor: '#000000' },
    ],
    activePeriods: [
      { start: new Date(Date.now() - 604800000).toISOString(), end: null },
    ],
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'alert-005',
    title: 'M15 bus rerouted due to water main break on 1st Ave',
    description:
      'The M15 and M15-SBS buses are being rerouted away from 1st Ave between 34th St and 42nd St due to an emergency water main break. Expect delays of 10–20 minutes in the affected area.',
    severity: 'REDUCED_SERVICE',
    status: 'ACTIVE',
    affectedLines: [
      { id: 'M15', name: 'M15', type: 'BUS', color: '#6B7280', textColor: '#FFFFFF' },
    ],
    activePeriods: [
      { start: new Date(Date.now() - 5400000).toISOString(), end: null },
    ],
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'alert-006',
    title: 'G train reduced service on weekends',
    description:
      'G trains are operating every 20 minutes on weekends due to ongoing track work between Court Sq and Church Av. This schedule is in effect until further notice.',
    severity: 'REDUCED_SERVICE',
    status: 'ACTIVE',
    affectedLines: [
      { id: 'G', name: 'G', type: 'SUBWAY', color: '#6CBE45', textColor: '#000000' },
    ],
    activePeriods: [
      { start: new Date(Date.now() - 1209600000).toISOString(), end: null },
    ],
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
  },
  {
    id: 'alert-007',
    title: '7 train free fare pilot information',
    description:
      'The MTA is launching a fare-free pilot on the 7 train between 34 St-Hudson Yards and Queensboro Plaza every Saturday in November. No MetroCard or OMNY tap required at these stations during pilot hours (10 AM – 6 PM).',
    severity: 'INFORMATION',
    status: 'UPCOMING',
    affectedLines: [
      { id: '7', name: '7', type: 'SUBWAY', color: '#B933AD', textColor: '#FFFFFF' },
    ],
    activePeriods: [
      {
        start: new Date(Date.now() + 604800000).toISOString(),
        end: new Date(Date.now() + 2419200000).toISOString(),
      },
    ],
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'alert-008',
    title: '1/2/3 trains: skip-stop service downtown',
    description:
      '1 trains are running express between 72 St and 14 St during the morning rush due to congestion. 2 and 3 trains are making all local stops. Customers at 50 St, 42 St-Times Sq, 28 St, and 18 St should board the 2 or 3.',
    severity: 'SERVICE_CHANGE',
    status: 'ACTIVE',
    affectedLines: [
      { id: '1', name: '1', type: 'SUBWAY', color: '#EE352E', textColor: '#FFFFFF' },
      { id: '2', name: '2', type: 'SUBWAY', color: '#EE352E', textColor: '#FFFFFF' },
      { id: '3', name: '3', type: 'SUBWAY', color: '#EE352E', textColor: '#FFFFFF' },
    ],
    activePeriods: [
      { start: new Date(Date.now() - 3600000).toISOString(), end: new Date(Date.now() + 7200000).toISOString() },
    ],
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]
