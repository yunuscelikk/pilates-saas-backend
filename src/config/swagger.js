const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pilates Studio SaaS API',
      description: 'Multi-tenant CRM and booking system for Pilates studios. All protected endpoints require a Bearer token obtained from the Auth endpoints.',
      version: '1.0.0',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
        Studio: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Zen Pilates Studio' },
            slug: { type: 'string', example: 'zen-pilates' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            is_active: { type: 'boolean' },
            settings: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            role: { type: 'string', enum: ['owner', 'admin', 'staff'] },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Member: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            emergency_contact_name: { type: 'string' },
            emergency_contact_phone: { type: 'string' },
            notes: { type: 'string' },
            is_active: { type: 'boolean' },
            joined_at: { type: 'string', format: 'date' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Trainer: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            specializations: { type: 'array', items: { type: 'string' } },
            bio: { type: 'string' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Class: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            duration_minutes: { type: 'integer' },
            max_capacity: { type: 'integer' },
            class_type: { type: 'string', enum: ['group', 'private', 'semi_private'] },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        ClassSession: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            class_id: { type: 'string', format: 'uuid' },
            trainer_id: { type: 'string', format: 'uuid' },
            start_time: { type: 'string', format: 'date-time' },
            end_time: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['scheduled', 'in_progress', 'completed', 'cancelled'] },
            current_capacity: { type: 'integer' },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
            class_session_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['confirmed', 'cancelled', 'waitlisted', 'no_show'] },
            booked_at: { type: 'string', format: 'date-time' },
            cancelled_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        MembershipPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            plan_type: { type: 'string', enum: ['class_pack', 'time_based', 'unlimited'] },
            classes_included: { type: 'integer', nullable: true },
            duration_days: { type: 'integer', nullable: true },
            price: { type: 'number', format: 'decimal' },
            currency: { type: 'string', example: 'TRY' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Membership: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
            membership_plan_id: { type: 'string', format: 'uuid' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date', nullable: true },
            classes_remaining: { type: 'integer', nullable: true },
            status: { type: 'string', enum: ['active', 'expired', 'cancelled', 'frozen'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
            membership_id: { type: 'string', format: 'uuid', nullable: true },
            amount: { type: 'number', format: 'decimal' },
            currency: { type: 'string', example: 'TRY' },
            payment_method: { type: 'string', enum: ['cash', 'credit_card', 'bank_transfer', 'other'] },
            status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
            payment_date: { type: 'string', format: 'date' },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid', nullable: true },
            member_id: { type: 'string', format: 'uuid', nullable: true },
            title: { type: 'string' },
            body: { type: 'string' },
            type: { type: 'string', enum: ['info', 'warning', 'reminder', 'system'] },
            is_read: { type: 'boolean' },
            read_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            sender_type: { type: 'string', enum: ['user', 'member'] },
            sender_id: { type: 'string', format: 'uuid' },
            recipient_type: { type: 'string', enum: ['user', 'member'] },
            recipient_id: { type: 'string', format: 'uuid' },
            subject: { type: 'string' },
            body: { type: 'string' },
            is_read: { type: 'boolean' },
            read_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
            class_session_id: { type: 'string', format: 'uuid' },
            check_in_time: { type: 'string', format: 'date-time' },
            check_out_time: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['checked_in', 'checked_out', 'no_show'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized - Invalid or missing token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, error: 'Unauthorized' },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, error: 'You do not have permission to perform this action' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, error: 'Not found' },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, error: 'Internal server error' },
            },
          },
        },
      },
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number',
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          description: 'Items per page',
        },
        IdParam: {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Resource UUID',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication and registration' },
      { name: 'Studios', description: 'Studio management' },
      { name: 'Users', description: 'Staff user management' },
      { name: 'Members', description: 'Member management' },
      { name: 'Trainers', description: 'Trainer management' },
      { name: 'Classes', description: 'Class definitions' },
      { name: 'ClassSessions', description: 'Scheduled class sessions' },
      { name: 'Bookings', description: 'Class session bookings' },
      { name: 'MembershipPlans', description: 'Membership plan definitions' },
      { name: 'Memberships', description: 'Member subscriptions' },
      { name: 'Payments', description: 'Payment records' },
      { name: 'Attendances', description: 'Check-in / check-out tracking' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Messages', description: 'Internal messaging' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
