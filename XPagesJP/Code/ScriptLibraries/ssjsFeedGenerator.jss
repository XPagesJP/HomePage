FEED_STD_ENTRY_COUNT = 50;		// used, if no "count" URL parameter is set
FEED_FORMAT_ATOM = "atom";
FEED_FORMAT_RSS = "rss";

// configuration document data
var feedTitle = "";
var feedSubtitle = "";
var feedLink = "";
var feedIcon = "";
var fePublished;
var feUpdated;
var feTitle;
var feAuthor;
var feLink;
var feAbstract;
var feID;

function FeedGenerator() {
	this.prototype.getFeed = function() {
		var exCon = facesContext.getExternalContext();
		var writer = facesContext.getResponseWriter();
		var response = exCon.getResponse();
		var feed:String;
		var entryCount:int;
		var format:String;
		
		// Feed information
		FEED_LINK_SELF = "https://www.xpages.jp/xpagesjp.nsf";
		feedTitle    = "XPages.JP";
		feedSubtitle = "XPages.JP の活動からの成果物や連絡事項などをブログで情報発信をしていきます。";
		feedLink     = "https://www.xpages.jp/xpagesjp.nsf";
		feedIcon     = "https://www.xpages.jp/xpagesjp.nsf?OpenIcon";
		
		entryCount = FEED_STD_ENTRY_COUNT;
		if ( context.getUrl().hasParameter("count") ) {
			entryCount = parseInt( context.getUrl().getParameter("count"), 10 );
			if ( isNaN(entryCount) ) entryCount = FEED_STD_ENTRY_COUNT;
		}
		
		// select RSS or ATOM
		format = FEED_FORMAT_RSS;
		if ( context.getUrl().hasParameter("format") ) {
			format = context.getUrl().getParameter("format").toLowerCase();
			if ( !format.equals(FEED_FORMAT_ATOM) && !format.equals(FEED_FORMAT_RSS) ) format = FEED_FORMAT_ATOM;
		}
		
		response.setContentType( "text/xml" );
		response.setHeader( "Cache-Control", "no-cache" );
		
		var dataService   = new NotesDataService();
		var feedFormatter = new FeedFormatter(format);
		
		// get feed information
		feed = feedFormatter.startFeed();
		feed += feedFormatter.getFeedInfo( dataService.getFeedInfo(), entryCount );
		feed += feedFormatter.getFeedEntries( dataService.getFeedEntries(entryCount) );
		feed += feedFormatter.endFeed();
		
		writer.write(feed);
		writer.endDocument();
		facesContext.responseComplete();
	}
}
function FeedFormatter(feedFormat) {
	this.prototype.startFeed = function() {
		switch (feedFormat) {
			case FEED_FORMAT_ATOM:
				return '<?xml version="1.0" encoding="utf-8"?>\n\n<feed xmlns="http://www.w3.org/2005/Atom">\n';
			case FEED_FORMAT_RSS:
				return '<?xml version="1.0" encoding="utf-8"?>\n\n<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n\n\t<channel>\n';
		}
	}
	this.prototype.endFeed = function() {
		switch (feedFormat) {
			case FEED_FORMAT_ATOM:
				return '</feed>';
			case FEED_FORMAT_RSS:
				return '\t</channel>\n</rss>';
		}
	}
	this.prototype.getFeedInfo = function(feedInfo, entryCount) {
		var dateFormat:java.text.SimpleDateFormat;
		var sb:java.lang.StringBuilder = new java.lang.StringBuilder();
		var temp:String;
		
		switch (feedFormat) {
			case FEED_FORMAT_ATOM:
				dateFormat =  new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
				
				sb.append('\t<title>').append(feedInfo["Title"]).append('</title>\n');
				if (feedInfo["Subtitle"] != "") {
					sb.append('\t<subtitle>').append(feedInfo["Subtitle"]).append('</subtitle>\n');
				}
				sb.append('\t<link href="').append(escapeHTML(feedInfo["Link"])).append('" />\n');
				sb.append('\t<link rel="self" href="').append(FEED_LINK_SELF).append('?format=').append(feedFormat).append('&amp;count=' + entryCount.toString()).append('" />\n');
				sb.append('\t<id>').append(escapeHTML(feedInfo["ID"])).append('</id>\n');
				temp = dateFormat.format(feedInfo["Updated"]);
				sb.append('\t<updated>').append(temp.substr(0, temp.length-2) + ":").append(temp.substr(temp.length-2, 2)).append('</updated>\n');
				sb.append('\t\t<icon>' + feedIcon + '</icon>\n');
				sb.append('\t\t<logo>' + feedIcon + '</logo>\n');
				break;
				
			case FEED_FORMAT_RSS:
				dateFormat = new java.text.SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss Z", new java.util.Locale("en"));
				
				sb.append('\t\t<title>').append(feedInfo["Title"]).append('</title>\n');
				if (feedInfo["Subtitle"] != "") {
					sb.append('\t\t<description>').append(feedInfo["Subtitle"]).append('</description>\n');
				}
				sb.append('\t\t<link>').append(escapeHTML(feedInfo["Link"])).append('</link>\n');
				sb.append('\t\t<atom:link rel="self" type="application/rss+xml" href="').append(FEED_LINK_SELF).append('?format=').append(feedFormat).append('&amp;count=' + entryCount.toString()).append('" />\n');
				sb.append('\t\t<lastBuildDate>').append(dateFormat.format(feedInfo["Updated"])).append('</lastBuildDate>\n');
				sb.append('\t\t<image>\n');
				sb.append('\t\t\t<url>' + feedIcon + '</url>\n');
				sb.append('\t\t\t<title>').append(feedInfo["Title"]).append('</title>\n');
				sb.append('\t\t\t<link>').append(escapeHTML(feedInfo["Link"])).append('</link>\n');
				sb.append('\t\t\t<width>32</width>\n');
				sb.append('\t\t\t<height>32</height>\n');
				sb.append('\t\t\t<description>').append(feedInfo["Subtitle"]).append('</description>\n');
				sb.append('\t\t</image>\n');
				break;
		}
		return sb.toString();
	}
	this.prototype.getFeedEntries = function(entryList) {
		var dateFormat:java.text.SimpleDateFormat;
		var sb:java.lang.StringBuilder = new java.lang.StringBuilder();
		var temp:String;
		
		switch (feedFormat) {
			case FEED_FORMAT_ATOM:
				dateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
				
				for (var i = 0; i < entryList.length; i++) {
					sb.append('\t<entry>\n');
					sb.append('\t\t<title>').append(escapeHTML(entryList[i]["Title"])).append('</title>\n');
					temp = escapeHTML(entryList[i]["Link"]);
					sb.append('\t\t<link rel="alternate" type="text/html" href="').append(temp).append('" />\n');
					sb.append('\t\t<id>').append(temp).append('</id>\n');
					temp = dateFormat.format(entryList[i]["Updated"]);
					sb.append('\t\t<updated>').append(temp.substr(0, temp.length-2) + ":").append(temp.substr(temp.length-2, 2)).append('</updated>\n');
					temp = dateFormat.format(entryList[i]["Published"]);
					sb.append('\t\t<published>').append(temp.substr(0, temp.length-2) + ":").append(temp.substr(temp.length-2, 2)).append('</published>\n');
					sb.append('\t\t<author>\n');
					sb.append('\t\t\t<name>').append(entryList[i]["Author"]).append('</name>\n');
					sb.append('\t\t</author>\n');
					sb.append('\t\t<summary type="html">\n');
					sb.append('\t\t\t<![CDATA[').append(entryList[i]["Abstract"].replace(']]>', '')).append(']]>\n');
					sb.append('\t\t</summary>\n');
					sb.append('\t</entry>\n\n');
				}
				break;
				
			case FEED_FORMAT_RSS:
				dateFormat = new java.text.SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss Z", new java.util.Locale("en"));
				
				for (var i = 0; i < entryList.length; i++) {
					sb.append('\t\t<item>\n');
					sb.append('\t\t\t<title>').append(escapeHTML(entryList[i]["Title"])).append('</title>\n');
					temp = escapeHTML(entryList[i]["Link"]);
					sb.append('\t\t\t<link>').append(temp).append('</link>\n');
					sb.append('\t\t\t<guid>').append(temp).append('</guid>\n');
					sb.append('\t\t\t<pubDate>').append(dateFormat.format(entryList[i]["Published"])).append('</pubDate>\n');
					sb.append('\t\t\t<dc:creator>').append(entryList[i]["Author"]).append('</dc:creator>\n');
					sb.append('\t\t\t<content:encoded>\n');
					sb.append('\t\t\t\t<![CDATA[').append(entryList[i]["Abstract"].replace(']]>', '')).append(']]>\n');
					sb.append('\t\t\t</content:encoded>\n');
					sb.append('\t\t</item>\n\n');
				}
				break;
		}
		return sb.toString();
	}
	function escapeHTML(escapeString) {
   		return escapeString.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;");
	}
}
function NotesDataService() {
	this.prototype.getFeedInfo = function() {
		var feedInfo = new Object();
		var url = context.getUrl();
		
		feedInfo["Title"]    = feedTitle;
		feedInfo["Subtitle"] = feedSubtitle;
		feedInfo["Link"]     = feedLink;
		feedInfo["Updated"]  = new Date();
		feedInfo["ID"]       = url.toString();
		
		return feedInfo;
	}
	this.prototype.getFeedEntries = function(entryCount) {
		var entryList = new Array();
		var feedEntry;
		var vwNews:NotesView = null;
		var vnNews:NotesViewNavigator = null;
		var veNews:NotesViewEntry = null;
		var docNews:NotesDocument = null;
		var mime:NotesMIMEEntity = null;
		var feedAbstract;
		try {
			vwNews = database.getView( "vBlogs" );
			vnNews = vwNews.createViewNav();
			veNews = vnNews.getFirstDocument();
			var i = 0;
			while ( veNews != null ) {
				docNews = veNews.getDocument();
				
				feedEntry = new Object();
				feedEntry["Published"] = docNews.getItemValue( "date" ).get(0).toJavaDate();			// 公開日時
				feedEntry["Updated"]   = docNews.getLastModified().toJavaDate();						// 最終更新日時
				feedEntry["Title"]     = docNews.getItemValueString( "title" );							// タイトル
				feedEntry["Author"]    = docNews.getItemValueString( "authors" );						// 作成者名
				feedEntry["Link"]      = FEED_LINK_SELF + "/blog.xsp?action=openDocument&documentId=" + docNews.getUniversalID();	// URLリンク
				feedEntry["ID"]        = docNews.getUniversalID();										// ID情報
				// 概要
				mime = docNews.getMIMEEntity( "description" );
				feedAbstract = "";
				if ( mime != null ) {
					if ( mime.getContentType() == "text" ) {
						feedAbstract = mime.getContentAsText();
					}
				}
				feedEntry["Abstract"] = feedAbstract;
				entryList[i]    = feedEntry;
				i++;
				
				veNews = vnNews.getNextDocument();
			}
		} catch (e) {
			print( "-----[getEntries] has error start-----" );
			print(e);
			print( "-----[getEntries] has error end-----" );
		} finally {
			if ( mime != null ) mime.recycle();
			if ( docNews != null ) docNews.recycle();
			if ( veNews != null ) veNews.recycle();
			if ( vnNews != null ) vnNews.recycle();
			if ( vwNews != null ) vwNews.recycle();
		}
		return entryList;
	}
}