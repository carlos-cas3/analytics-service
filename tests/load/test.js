const config = {
  target: 'http://localhost:3003',
  phases: [
    { duration: 30,  arrivalRate: 1,   name: 'warm_up' },
    { duration: 30,  arrivalRate: 5,   name: 'low_load' },
    { duration: 30,  arrivalRate: 20,  name: 'medium_load' },
    { duration: 30,  arrivalRate: 50,  name: 'high_load' },
    { duration: 30,  arrivalRate: 100, name: 'stress_test' },
  ],
  processor: './processor.js',
  http: {
    defaults: {
      headers: {
        'x-api-key': '{{ $processEnvironment.INTERNAL_API_KEY }}',
        'Content-Type': 'application/json',
      },
    },
  },
};

const scenarios = [
  {
    name: 'Ingest analytic events',
    engine: 'http',
    flow: [
      { function: 'setEventId' },
      {
        post: {
          url: '/api/events',
          json: {
            event_id: '{{ event_id }}',
            type: 'USER_CREATED',
            service: 'auth-service',
            aggregate_type: 'user',
            aggregate_id: '{{ aggregate_id }}',
            vendor_ids: [],
            payload: { key: 'value' },
            event_timestamp: '2024-01-15T10:30:00.000Z',
          },
        },
      },
    ],
  },
];

module.exports = { config, scenarios };
