import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable('user', {
    id: integer().primaryKey(),
    name: text(),
    email: text().unique().notNull(),
    salt: text(),
    is_staff: integer(),
    groups: text(),
    password: text(),
    picture: text(),
    phone_number: text(),
    created_at: integer().$default(() => new Date().getTime()),
    updated_at: integer().$default(() => new Date().getTime()),

});


export const tagTable = sqliteTable('tag', {
    id: integer().primaryKey(),
    name: text(),
    description: text(),
    type: text(), //type like pulsa_vendor or etc
    created_at: integer().$default(() => new Date().getTime()),
    created_by: integer().references(() => userTable.id, {
        onDelete: "cascade",
    }),
    updated_at: integer().$default(() => new Date().getTime()),
    updated_by: integer().references(() => userTable.id, {
        onDelete: "cascade",
    })
})

export const productTable = sqliteTable('product', {
    id: integer().primaryKey(),
    name: text(),
    price: integer(),
    price_sell: integer(),
    data: text(), //json struktur
    status: integer().default(1), // 0 disable, 1 active
    created_at: integer().$default(() => new Date().getTime()),
    created_by: integer().references(() => userTable.id, {
        onDelete: "cascade",
    }),
    updated_at: integer().$default(() => new Date().getTime()),
    updated_by: integer().references(() => userTable.id, {
        onDelete: "cascade",
    })
});

export const productTagTable = sqliteTable('product_tag', {
    id: integer().primaryKey(),
    product_id: integer().references(() => productTable.id, {
        onDelete: "cascade",
    }),
    tag_id: integer().references(() => tagTable.id, {
        onDelete: "cascade",
    }),
    created_at: integer().$default(() => new Date().getTime()),
});

export const transactionTable = sqliteTable('transaction', {
    id: integer().primaryKey(),
    key: text().unique().$default(()=> crypto.randomUUID().toString()),
    product_id: integer().references(() => productTable.id, {
        onDelete: "set null", 
    }),
    user_id: integer().references(() => userTable.id, {
        onDelete: "set null", 
    }), 
    amount: integer(),
    price: integer(),
    profit: integer().default(0),
    data: text(), //json struktur
    status: integer().default(1), // 0 done, 1 pending, 3 failed, 4 problem
    date: integer().$default(() => new Date().getTime()),
    created_at: integer().$default(() => new Date().getTime()),
    updated_at: integer().$default(() => new Date().getTime()),
    created_by: integer().references(() => userTable.id, {
        onDelete: "set null", 
    }),
    updated_by: integer().references(() => userTable.id, {
        onDelete: "set null",
    }),
});


export const webhookTable = sqliteTable('webhook', {
    id: integer().primaryKey(),
    data: text(),
    created_at: integer().$default(() => new Date().getTime()),
})