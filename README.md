# Integrating With HubSpot I: Foundations Practicum

This Node.js application reads Workshops from a HubSpot developer test account and creates new Workshop records from an HTML form. It uses Express, Axios, Pug, and dotenv.

## HubSpot developer test account

- Account name: Tom Practicum Test Account
- Account ID: 149721974
- Custom object: Workshops
- Object type ID: 2-256220719
- [Open the Workshops list in the developer test account](https://app-eu1.hubspot.com/contacts/149721974/objects/2-256220719/views/all/list)

The Workshops schema supports associations with Contacts.

| Property label | Internal name | Type |
| --- | --- | --- |
| Name | name | String, single-line text |
| Topic | topic | String, single-line text |
| Capacity | capacity | Number |

Initial records include Leadership Essentials, Executive Communication, and Strategy Workshop.

## Run locally

1. Install Node.js and clone this fork.
2. Run `npm install` from the repository directory.
3. Copy `.env.example` to `.env`.
4. Set `HUBSPOT_ACCESS_TOKEN` to the token for Tom's Practicum Private App in the test account. Set `HUBSPOT_TEST_ACCOUNT_ID=149721974` and `HUBSPOT_OBJECT_TYPE_ID=2-256220719`.
5. Run `node index.js`.
6. Open http://localhost:3000.

The local app listens on 127.0.0.1. Keep `.env` local. Its contents and the private-app token must never be committed or shared.

The private app requires these scopes:

- `crm.schemas.custom.read`
- `crm.schemas.custom.write`
- `crm.objects.custom.read`
- `crm.objects.custom.write`
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`

## Routes and templates

| Method and route | Purpose | Template |
| --- | --- | --- |
| `GET /` | Retrieve Workshop records, including all three properties, and render a table. Follows pagination for additional records. | `views/homepage.pug` |
| `GET /update-cobj` | Render the form with the title required by the practicum. | `views/updates.pug` |
| `POST /update-cobj` | Validate the form, create a Workshop through the HubSpot API, and redirect to the homepage. | Redirect |

The homepage includes an "Add to this table" link. The form includes a "Return to the homepage" link. CSS is in `public/css/style.css`.

## Verify the workflow

1. Open the homepage and confirm that the existing Workshops appear with Name, Topic, and Capacity.
2. Click "Add to this table" and enter a name, topic, and positive whole-number capacity.
3. Submit the form. The app creates a record and redirects to the homepage, where the new Workshop appears.
4. Confirm that the same record appears in the HubSpot Workshops list linked above.
5. Empty fields and invalid capacity values are rejected before a HubSpot write.

API failures display an error. If a submission cannot be confirmed, inspect the HubSpot records before retrying it, since the remote write may have completed. Error logging excludes the access token and request headers.

## Submission

Submit the public URL of this fork after the working branch is merged into `main`. The practicum does not require a hosted deployment.
