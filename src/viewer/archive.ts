/**
 * Functions for dealing with twarc (https://github.com/DocNow/twarc) archives.
 */
namespace Archive {
    /**
     * Escape HTML special characters in the given string.
     */
    function escapeHTML(html: string) {
        let elem = document.createElement('div');
        elem.appendChild(document.createTextNode(html))
        return elem.innerHTML;
    }

    /**
     * Parse an object in the format of a Twitter API response into a
     * (Tweet, parent id) pair.
     */
    function parseTweet(tweetObject: any): [Tweet, string] {
        let tweet = new Tweet();
        let reply_to_id = tweetObject['in_reply_to_status_id_str'];

        tweet.avatar = tweetObject['user']['profile_image_url_https'];
        tweet.bodyHtml = escapeHTML(tweetObject['text']);
        tweet.bodyText = tweetObject['text'];
        tweet.id = tweetObject['id_str'];
        tweet.name = tweetObject['user']['name'];
        tweet.replies = 0; // Not available in archive data.
        tweet.username = tweetObject['user']['screen_name'];
        tweet.time = new Date(tweetObject['created_at']).getTime();
        return [tweet, reply_to_id];
    }

    /**
     * Create a TweetNode tree from a list where each element is a tweet
     * in Twitter API format.
     */
    export function parseTweetsFromArchive(archive: any[]) {
        let nodes = new Map<String, TweetNode>();

        let [rootTweet, _] = parseTweet(archive.shift());
        let rootNode = new TweetNode(rootTweet);
        nodes.set(rootTweet.id, rootNode);
        archive.sort((o1, o2) => {
            return parseInt(o1.id) - parseInt(o2.id);
        });

        for (let arcTweet of archive) {
            let [tweet, parent] = parseTweet(arcTweet);
            if (!nodes.has(parent)) {
                alert('Orphaned tweet detected! See the readme for format details. Aborting.');
                return;
            }
            let parentNode = nodes.get(parent);
            let tweetNode = new TweetNode(tweet);
            parentNode.children.set(tweet.id, tweetNode);
            console.log(tweet.id);
            nodes.set(tweet.id, tweetNode);
        }
        return rootNode;
    }
}