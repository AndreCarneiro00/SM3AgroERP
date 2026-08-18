PRAGMA foreign_keys = OFF;

CREATE TABLE cut_new (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         field_id INTEGER NOT NULL,
                         product_id INTEGER NOT NULL,
                         cut_date DATE NOT NULL,
                         cut_number INTEGER NOT NULL,
                         status TEXT NOT NULL DEFAULT 'DONE' CHECK (
                             status IN ('DONE', 'CANCELED')
                             ),
                         observation TEXT,
                         days_since_last_cut INTEGER,

                         FOREIGN KEY (field_id) REFERENCES field(id),
                         FOREIGN KEY (product_id) REFERENCES product(id)
);

INSERT INTO cut_new (
    id,
    field_id,
    product_id,
    cut_date,
    cut_number,
    status,
    observation,
    days_since_last_cut
)
SELECT
    cut.id,
    cut.field_id,
    COALESCE(
            (
                SELECT inventory_batch.product_id
                FROM production_batch
                         JOIN inventory_batch ON inventory_batch.id = production_batch.inventory_batch_id
                WHERE production_batch.cut_id = cut.id
                ORDER BY production_batch.id
                LIMIT 1
            ),
            (
                SELECT product.id
                FROM product
                WHERE product.product_family_id = cut.product_family_id
                  AND product.has_stock = 1
                ORDER BY product.id
                LIMIT 1
            )
    ),
    cut.cut_date,
    cut.cut_number,
    cut.status,
    cut.observation,
    cut.days_since_last_cut
FROM cut;

DROP TABLE cut;
ALTER TABLE cut_new RENAME TO cut;

PRAGMA foreign_keys = ON;
