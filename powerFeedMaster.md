-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
What Powerfeed is (in one paragraph)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Powerfeed is a contract-first, deterministic, side-effect-free data transformation system for Shopify product ingestion. Contracts (immutable versions of a serialisable JSON document) are the sole source of truth for behaviour; the UI is only an editor. Runs execute exactly one contract version against a source snapshot, producing field outputs + structured errors/logs, with no silent failure.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
The “Non-Negotiables” you must enforce everywhere

✅ These are the platform’s constitutional invariants:
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
✅ Contract and behaviour

	1. All behaviour lives in the Contract Version JSON. No “helpful” defaults outside it.

	2. Append-only immutable versioning: contract versions are never updated; any change creates a new version.

	3. Determinism: (contract version + dataset + execution timestamp) ⇒ identical output, always.

	4. No implicit state: no UI memory, cached decisions, or “last run” behaviour affecting execution.

	5. Single execution authority: only the contract evaluation engine defines output behaviour.

	6. No silent failure: every skip, suppression, or failure must be explicitly logged with structured detail.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Field semantics
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
✅ Field presence is binary: unmapped fields do not exist in the system (no “ignored” concept).

✅ Each mapped field has:

	1. Exactly one expression

	2. An explicit behaviour_mode: ADD | UPDATE | PAUSED

✅ Behaviour modes are enforced by create/update context:

	1. Create: apply ADD + UPDATE, skip PAUSED

	2. Update: apply UPDATE, skip ADD + PAUSED

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Runs and history
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	✅. A Run is an immutable fact record: it binds source + contract_version + timestamp + input descriptor.

	✅. No retries (a retry is simply a new Run).

	✅. Partial success is expected: field-level errors do not abort the entire run unless it’s an orchestration failure.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Core platform components (what you’re building)

	✅ Source Management

		1. Setup → explicit Initialise → stored schema

		2. Sources are operational containers, not behaviour

	✅ Data Contract Management

		1. Draft (mutable, non-executable) → Activation → immutable Contract Version

	✅ Contract Evaluation Engine

		1. Stateless, deterministic evaluation of field expressions via the uniform pipeline

	✅ Run & Execution Layer

		1. Triggers (manual/scheduled/api), binds run to a contract version, orchestrates execution

	✅ Logging & Observability

		1. Structured logs, field outputs, errors/warnings; must explain “nothing happened”

	✅ Integrations

		1. IO only (file/FTP/SFTP/URL/Google Sheets/REST), no transformation logic

	✅ API Layer

		1. Auth, validation, orchestration; no business logic

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Canonical contract JSON (the executable truth)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	✅ Top-level fields you must support (as described):

		1. contract_id, contract_version_id, created_at, created_by

		2. governance (mandatory store-side filters; evaluated before identity resolution)

		3. identity (priority-ordered rules)

		4. creation_policy (allow | deny, explicitly required)

		5. field_mappings[] (target_field, behaviour_mode, expression, plus field-specific attributes)

		6. tags requires explicit merge mode: MERGE | REPLACE (mandatory if target_field=tags)

		7. inventory (explicit rules, absence policy, location_id)

		8. lifecycle (e.g., archive rules)

	✅ Activation validity gates (must block activation if missing/invalid):

		1. Governance scope defined

		2. Identity rules defined

		3. Creation policy defined (no default)

		4. Tags mapping includes explicit tag mode

		5. Inventory/lifecycle policies valid if present
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Execution pipeline (must be fixed-order, stage-logged)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	✅ Every field evaluation follows the same ordered pipeline:

		1. Input Resolution (detect missing source attributes explicitly)

		2. Pre-processing (trim/case/replace/regex extraction)

		3. Type Coercion (explicit only; failures are structured)

		4. Transformations (pure functions, declared order)

		5. Conditional Rules (explicit; no external state)

		6. Field Behaviour Enforcement (ADD/UPDATE/PAUSED + field extensions like tags)

		7. Output Emission (output or structured failure; no output for paused fields)

Identity resolution happens before any field evaluation, and governance scoping limits eligibility for identity matching and mutation.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Inventory + lifecycle + publishing (the safety rails)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Inventory

	✅ Explicit only; no inferred intent from absence.

	✅ Must bind inventory updates to exactly one Shopify location per contract.

	✅ Variant absence policy is explicit: leave_unchanged | set_zero | error

	✅ Mandatory order:

		1. governance filter

		2. identity resolution

		3. inventory mapping for present variants

		4. apply absence policy to missing variants

		5. finalize inventory

		6. evaluate lifecycle per product

	✅ Lifecycle

		1. Allowed example: archive product when all variants are zero (only if explicitly declared).

		2. No deletions.

	✅ Publishing (v1)

		1. Creation-only, boolean: publish all channels on create true/false

		2. Never re-evaluated on update

		3. No conditional publishing, no channel rules
		
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------		
Database model (what tables exist and what must be append-only)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	✅ Core entities

		1. Tenant/shop: shops

		2. Suppliers/providers: data_providers

		3. Blueprint templates: source_blueprints

		4. Pre-init setup: source_setups (draft intent only, not executable)

		5. Executable sources: sources

		6. Logical contract identity: data_contracts

		7. Immutable versions: contract_versions (JSONB contract_definition)

		8. Projection for query/analytics only: contract_field_projections (never used for execution)

		9. Execution records: runs

		10. Field outcomes: run_field_outputs

		11. Structured problems: run_errors

		12. Human-readable execution summary: run_logs

		13. Plus: shopify_entity_identities (cache/audit aid only; must not define behaviour)

		14. vPlus: partner_attributions, plan_entitlements, plan_entitlement_overrides

	✅ Append-only tables (no UPDATE allowed)

		1. contract_versions

		2. contract_field_projections

		3. runs

		4. run_field_outputs

		5. run_errors

		6. run_logs		
		
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------		
Logging + error architecture (operator-grade, structured)
Required run log envelope (minimum)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------		

	✅ Required run log envelope (minimum)

		1. timestamp

		2. source_id

		3. contract_version_id

		4. run_id

		5. input_descriptor

		6. counts: processed / added / updated / skipped

		7. field_summary: add/update/paused counts

		8. errors[]

		9. warnings[]
		…and logs must explain why nothing changed and why rows/fields were skipped (e.g., PAUSED, out-of-scope, identity unresolved, creation_policy deny).
		
	✅ Error codes

	1. Stable, unique, machine-readable (e.g., E001_MISSING_HEADER)

	2. API envelope always:

		2.1 success true/false

		2.2 data

		2.3 errors [{code, message, remedy, context}]		
		
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------		
Engineering constraints to bake into repo + reviews
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------		

		
	✅ Stack: TypeScript + Node (LTS), Postgres (RDS), AWS-hosted infra, dockerised.

	✅ Required architecture: Controllers → Services → Domain Engines → Data Access → Integrations

	✅ Forbidden:		

		1. business logic in controllers/routes

		2. stringy logs

		3. catch-and-ignore

		4. unapproved libraries

		5. any non-determinism

		6. any in-place contract version edits

		7. any hidden defaults
		
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------		
Build checklist (sequenced MVP path)
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------		

	✅ If you want a pragmatic implementation order that stays true to the spec:

		1. DB + immutability enforcement

		2. Create tables, constraints, and hard protections against UPDATEs on append-only tables.

	✅ Source lifecycle

		1. source_setups (draft) → explicit initialise → sources (with stored schema snapshot & operational_status rules)

	✅ Contract drafting + activation

		1. Draft store (mutable) + activation that writes contract_versions (immutable) + sets “active” pointer (however you model it)

		2. Activation validation gates

	✅ Expression engine v1

		1. Expression tree model + allowed function set only

		2. Deterministic evaluation + structured failure output

	✅ Uniform field evaluation pipeline

		Implement stages exactly; stage-level structured logging hooks

	✅ Identity resolution

		1. Priority rules + governed-scope restriction + explicit unresolved handling

	✅ Run orchestration

		1. Create run record first, bind contract version, execute, persist outputs/errors/logs

		2. Trigger types: manual/scheduled/api

	✅ Inventory + lifecycle

		1. Single-location enforcement + absence policies + lifecycle evaluation order

	✅ Publishing on create

		1. Only during create path, never on update

	✅ Admin/support surfaces

		1. Read-only raw contract JSON viewer

		2. Version inspection/diff

		3. Run inspection: identity outcomes, inventory decisions, lifecycle actions, per-field results		