const path = require("path");
const { google } = require("googleapis");

const KEY_FILE_LOCATION = "myserviceapp-123456-123456789abc.json";
const MYAPP_VIEWID = "123456789";

// This authClient singleton is reusable
const getAuthClient = (function () {
    let authClient;
    return function () {
        if (!authClient) {
            const credentials = require(path.join(__dirname, `./${KEY_FILE_LOCATION}`));
            authClient = new google.auth.JWT(
                credentials.client_email,
                null,
                credentials.private_key,
                ["https://www.googleapis.com/auth/analytics"]
            );
        }
        return authClient;
    };
})();

module.exports = {
    analyticsReportingDemo: async function() {
        // Events & dimensions to pick from:
        // https://ga-dev-tools.appspot.com/dimensions-metrics-explorer/
        // Test queries here:
        // https://ga-dev-tools.appspot.com/query-explorer/

        /*
            Goal of this sample code is to retrieve "Item" events with action "Add to Order",
            and return their labels (which consists of the name of the item).
            On the client, this was logged as:

            ReactGA.event({
                category: 'Item',
                action: 'Add to Order',
                label: 'Pizza',
            });
         */

        const authClient = getAuthClient();

        let error;

        authClient.authorize(function (err, tokens) {
            if (err) {
                error = err;
            } else {
                authClient.setCredentials(tokens);
            }
        });

        if (error) {
            return { error: "Authentication error" };
        }

        const analyticsreporting = google.analyticsreporting({
            version: "v4",
            auth: authClient
        });

        const getAnalyticsResponse = await analyticsreporting.reports.batchGet({
            requestBody: {
                reportRequests: [
                    {
                        viewId: MYAPP_VIEWID,
                        dateRanges: [
                            {
                                startDate: "7daysAgo",
                                endDate: "today"
                            }
                        ],
                        metrics: [
                            {
                                // Get "all events"
                                expression: "ga:totalEvents"
                            }
                        ],
                        dimensions: [
                            {
                                // A dimension will return this additional data alongside the metric
                                name: "ga:eventLabel"
                            }
                        ],
                        dimensionFilterClauses: [
                            {
                                // Join filters with 'AND'
                                operator: 'AND',
                                filters: [
                                    {
                                        // Filter by eventCategory==='Item'
                                        dimensionName: 'ga:eventCategory',
                                        operator: 'EXACT',
                                        expressions: ['Item']
                                    },
                                    {
                                        // Filter by eventAction==='Add to Order'
                                        dimensionName: 'ga:eventAction',
                                        operator: 'EXACT',
                                        expressions: ['Add to Order']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        });

        return getAnalyticsResponse.data;
    }
}