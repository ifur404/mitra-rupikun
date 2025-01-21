import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { TPriceList } from "~/lib/digiflazz";
import { TDataLedger } from "~/routes/panel.transaksi._index";

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

export const webhookTable = sqliteTable('webhook', {
    id: integer().primaryKey(),
    data: text({mode: 'json'}).$type<{}>(),
    created_at: integer().$default(() => new Date().getTime()),
})

export const ledgerTable = sqliteTable('ledger', {
    id: integer().primaryKey(),
    uuid: text().$default(()=> crypto.randomUUID()),
    key: text().notNull(),
    before: integer().default(0),
    mutation: integer().default(0),
    after: integer().notNull(),
    data: text({mode: 'json'}).$type<TDataLedger>(),
    created_by: integer().references(() => userTable.id, {
        onDelete: "set null",
    }),
    created_at: integer().$default(() => new Date().getTime()), 
});

export const productTable = sqliteTable('product', {
    id: integer().primaryKey(),
    code: text().notNull().unique(),
    name: text(),
    price: integer(),
    data: text({mode: 'json'}).$type<TPriceList>(), //json struktur
    category: text(),
    created_at: integer().$default(() => new Date().getTime()),
    created_by: integer().references(() => userTable.id, {
        onDelete: "cascade",
    }),
    updated_at: integer().$default(() => new Date().getTime()),
    updated_by: integer().references(() => userTable.id, {
        onDelete: "cascade",
    })
});
