# callernotes-desktop
CallerNotes Desktop Client.

This is the desktop component for CallerNotes.  When calls are recieved and triggered by the CallerNotes Server, the CallerNotes Desktop Client launches a window with contextual information that provides caller information from API services and an editable text area that is stored remotely and can be shared with other agents on callers from that identity

Data for the CallerNote's server is stored in a CouchDB instance that is specified in the callernotes.cfg file.

Caller ID information is retrived from either NextCaller directly or any of the other datasources in the Twilio AddOn capalog including Nextcaller.
To specify which datasource to use, set it in the callernotes.cfg file along with your other settings.

For more information on CallerNotes, check out our website at http://callernotesapp.com
