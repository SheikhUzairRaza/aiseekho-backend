const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
    openapi: '3.0.3',
    info: {
        title: 'AI Seekho Orchestrator Backend API',
        version: '1.0.0',
        description: 'Express backend for authentication, users, chat orchestration, bookings, disputes, and provider analytics.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    paths: {
        '/api/auth/signup': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password', 'role', 'name'],
                                properties: {
                                    email: { type: 'string', example: 'user@example.com' },
                                    password: { type: 'string', example: 'password123' },
                                    role: { type: 'string', enum: ['customer', 'provider'], example: 'customer' },
                                    name: { type: 'string', example: 'Ali Khan' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'User created successfully' },
                    400: { description: 'User already exists' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login user',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'user@example.com' },
                                    password: { type: 'string', example: 'password123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Login successful' },
                    401: { description: 'Invalid credentials' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/user/me': {
            get: {
                tags: ['User'],
                summary: 'Get current authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Authenticated user profile' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/user/location': {
            post: {
                tags: ['User'],
                summary: 'Update user location',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['location'],
                                properties: {
                                    location: {
                                        type: 'object',
                                        properties: {
                                            latitude: { type: 'number', example: 33.6844 },
                                            longitude: { type: 'number', example: 73.0479 },
                                            address: { type: 'string', example: 'F-8 Markaz, Islamabad' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Location updated' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/chat': {
            post: {
                tags: ['Chat'],
                summary: 'Process a natural language service request',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['message'],
                                properties: {
                                    message: { type: 'string', example: 'Mujhe plumber chahiye kal subah' },
                                    city: { type: 'string', example: 'Islamabad' },
                                    location: {
                                        type: 'object',
                                        properties: {
                                            lat: { type: 'number', example: 33.6844 },
                                            lng: { type: 'number', example: 73.0479 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'AI workflow completed' },
                    400: { description: 'Message is required' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/chat/traces': {
            get: {
                tags: ['Chat'],
                summary: 'Get recent AI agent traces',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Trace list returned' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/history': {
            get: {
                tags: ['Bookings'],
                summary: 'Get booking history for the authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Booking history returned' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/confirm': {
            post: {
                tags: ['Bookings'],
                summary: 'Confirm a booking',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['providerId', 'serviceType', 'amount', 'scheduledWindow', 'startTime'],
                                properties: {
                                    providerId: { type: 'string', example: '682b6d5e8b8c4d0012345678' },
                                    serviceType: { type: 'string', example: 'ac_technician' },
                                    amount: { type: 'number', example: 3500 },
                                    scheduledWindow: { type: 'string', example: 'Today, 02:00 PM - 03:00 PM' },
                                    startTime: { type: 'string', format: 'date-time', example: '2026-05-20T14:00:00.000Z' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Booking confirmed' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/complete': {
            post: {
                tags: ['Bookings'],
                summary: 'Complete a booking and submit feedback',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['bookingId', 'feedback', 'rating'],
                                properties: {
                                    bookingId: { type: 'string', example: 'BKG-123456' },
                                    feedback: { type: 'string', example: 'Work completed successfully' },
                                    rating: { type: 'number', example: 5 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Completion processed' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/dispute': {
            post: {
                tags: ['Bookings'],
                summary: 'File a dispute for a booking',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['booking', 'complaint'],
                                properties: {
                                    booking: {
                                        type: 'object',
                                        example: {
                                            booking_id: 'BKG-123456',
                                            provider_name: 'Ahmed Electrician',
                                            total_amount: 2800,
                                            status: 'completed'
                                        }
                                    },
                                    complaint: {
                                        type: 'string',
                                        example: 'The provider charged extra and left the job incomplete'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Dispute processed' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/simulate-cancel': {
            post: {
                tags: ['Bookings'],
                summary: 'Simulate provider cancellation and reroute to another provider',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['intent', 'currentProviderId'],
                                properties: {
                                    intent: {
                                        type: 'object',
                                        example: {
                                            service_type: 'ac_technician',
                                            urgency: 'medium',
                                            budget_preference: 'standard',
                                            preferred_time: 'evening'
                                        }
                                    },
                                    currentProviderId: { type: 'string', example: '682b6d5e8b8c4d0012345678' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Reroute successful' },
                    404: { description: 'No alternative provider found' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        },
        '/api/provider-analytics/{id}': {
            get: {
                tags: ['Bookings'],
                summary: 'Get provider analytics summary',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'id',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                responses: {
                    200: { description: 'Analytics returned' },
                    401: { description: 'Unauthorized' },
                    500: { description: 'Server error' }
                }
            }
        }
    }
};

const setupSwagger = (app, port) => {
    swaggerDocument.servers = [
        {
            url: `http://localhost:${port}`,
            description: 'Local server'
        }
    ];

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.get('/api-docs.json', (req, res) => {
        res.json(swaggerDocument);
    });
};

module.exports = { setupSwagger, swaggerDocument };
