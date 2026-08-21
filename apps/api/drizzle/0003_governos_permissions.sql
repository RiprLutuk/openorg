INSERT INTO "permissions" ("key", "description")
VALUES
	('governance.read', 'View organization structure and appointments'),
	('governance.write', 'Manage units, positions, and appointments')
ON CONFLICT ("key") DO UPDATE
SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT "roles"."id", "permissions"."id"
FROM "roles"
CROSS JOIN "permissions"
WHERE "roles"."name" = 'Owner'
	AND "permissions"."key" IN ('governance.read', 'governance.write')
ON CONFLICT DO NOTHING;
