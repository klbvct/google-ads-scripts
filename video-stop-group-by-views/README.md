# Google Ads scripts - video-stop-group-by-views

This script retrieves all active video campaigns in Google Ads, then for each active campaign, it gathers statistics for active ad groups for the current month. It sums up the number of views for ad groups with the same name. If the total number of views for any group exceeds 11,200, all groups with that name are paused. During execution, the script logs information about the ad groups and their total view metrics.
