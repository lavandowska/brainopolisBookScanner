BOOK LOOK

Scans a books bar-code or otherwise looks for the ISBN (10 or 13 digits), then fetches information
about that book from the Google Books API.  Pricing information is retrieved from BookRun API, making a best guess if the book is new or used (which pricing is available).  The app is hosted at <https://bookrun.brainopolis.com>.

New users are granted 5 "scan" credits, more credits can be purchased (once Stripe integration is achieved).  TODO: Current goal is 1,000 credits for $10.

An export to WooCommerce's "import" format is supported.  Other formats may be in the future.

Users may create a local account with email & password or use Google OAuth.  
TODO: Add authentication with Facebook, Apple, others?