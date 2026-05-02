<?xml version="1.0" encoding="UTF-8"?>
<!-- styles.xsl — human-readable view for /rss.xml.
     Without this, browsers render the feed as raw XML.
     With this, it shows a styled page that explains what RSS is and
     links to each post. Subscribed readers ignore the stylesheet
     entirely. -->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>
          <xsl:value-of select="/rss/channel/title"/> · RSS
        </title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <style>
          :root {
            --bg: #050506;
            --ink: #F3F1EC;
            --ink-mid: #A8A6A0;
            --ink-low: #6B6965;
            --accent: #2E6BFF;
            --rule: rgba(243, 241, 236, 0.08);
          }
          html, body {
            margin: 0;
            background: var(--bg);
            color: var(--ink);
            font-family: 'Inter Tight', 'Helvetica Neue', sans-serif;
            font-feature-settings: 'ss01', 'cv11';
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }
          .wrap {
            max-width: 720px;
            margin: 0 auto;
            padding: 96px 32px 128px;
          }
          .mark {
            font-weight: 700;
            font-size: 15px;
            letter-spacing: -0.02em;
            color: var(--ink);
            text-decoration: none;
          }
          .kicker {
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: 11px;
            letter-spacing: 0.22em;
            color: var(--accent);
            margin: 64px 0 24px;
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .kicker .dot { width: 6px; height: 6px; background: var(--accent); }
          h1 {
            font-weight: 500;
            font-size: clamp(40px, 5vw, 64px);
            line-height: 0.98;
            letter-spacing: -0.04em;
            margin: 0 0 24px;
          }
          .lede {
            color: var(--ink-mid);
            font-size: 18px;
            line-height: 1.55;
            max-width: 56ch;
            margin: 0 0 48px;
          }
          .feed-url {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 12px 18px;
            border: 1px solid var(--rule);
            border-radius: 100px;
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: 12px;
            letter-spacing: 0.04em;
            color: var(--ink);
            text-decoration: none;
            transition: border-color 0.2s ease, color 0.2s ease;
            margin-bottom: 80px;
          }
          .feed-url:hover { border-color: var(--accent); color: var(--accent); }
          .feed-url::before {
            content: "";
            display: inline-block;
            width: 12px; height: 12px;
            background: currentColor;
            mask: url("data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'&gt;&lt;path d='M3.43 8.86c5.36 0 9.71 4.35 9.71 9.71h-2.86c0-3.78-3.07-6.86-6.86-6.86V8.86zm0-5.43c8.36 0 15.14 6.78 15.14 15.14h-2.86c0-6.78-5.5-12.29-12.29-12.29V3.43zm2.4 12c0 1.32-1.07 2.4-2.4 2.4S1.03 16.75 1.03 15.43s1.07-2.4 2.4-2.4 2.4 1.07 2.4 2.4z'/&gt;&lt;/svg&gt;") center / contain no-repeat;
            -webkit-mask: url("data:image/svg+xml;utf8,&lt;svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'&gt;&lt;path d='M3.43 8.86c5.36 0 9.71 4.35 9.71 9.71h-2.86c0-3.78-3.07-6.86-6.86-6.86V8.86zm0-5.43c8.36 0 15.14 6.78 15.14 15.14h-2.86c0-6.78-5.5-12.29-12.29-12.29V3.43zm2.4 12c0 1.32-1.07 2.4-2.4 2.4S1.03 16.75 1.03 15.43s1.07-2.4 2.4-2.4 2.4 1.07 2.4 2.4z'/&gt;&lt;/svg&gt;") center / contain no-repeat;
          }
          h2.list-head {
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.22em;
            color: var(--ink-low);
            margin: 0 0 24px;
            text-transform: uppercase;
          }
          ol {
            list-style: none;
            padding: 0;
            margin: 0;
            border-top: 1px solid var(--rule);
          }
          li {
            border-bottom: 1px solid var(--rule);
            padding: 28px 0;
          }
          .post-meta {
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: 10px;
            letter-spacing: 0.2em;
            color: var(--ink-low);
            text-transform: uppercase;
            margin-bottom: 10px;
            display: flex;
            gap: 14px;
          }
          .post-title {
            font-weight: 500;
            font-size: 24px;
            line-height: 1.2;
            letter-spacing: -0.025em;
            margin: 0 0 10px;
          }
          .post-title a { color: var(--ink); text-decoration: none; }
          .post-title a:hover { color: var(--accent); }
          .post-desc {
            color: var(--ink-mid);
            font-size: 15px;
            line-height: 1.55;
            margin: 0;
            max-width: 56ch;
          }
          .footer {
            margin-top: 96px;
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            font-size: 10px;
            letter-spacing: 0.22em;
            color: var(--ink-low);
            text-transform: uppercase;
          }
          .footer a { color: var(--ink); text-decoration: none; }
          .footer a:hover { color: var(--accent); }
        </style>
      </head>
      <body>
        <div class="wrap">
          <a class="mark" href="/">MR.</a>

          <div class="kicker">
            <span class="dot"></span>
            <span>RSS · WEB FEED</span>
          </div>

          <h1>
            <xsl:value-of select="/rss/channel/title"/>
          </h1>
          <p class="lede">
            <xsl:value-of select="/rss/channel/description"/>
            Subscribe in any feed reader (NetNewsWire, Reeder, Feedly, Inoreader)
            with the URL below.
          </p>

          <a class="feed-url">
            <xsl:attribute name="href">/rss.xml</xsl:attribute>
            <xsl:value-of select="/rss/channel/link"/><xsl:text>/rss.xml</xsl:text>
          </a>

          <h2 class="list-head">Latest posts</h2>
          <ol>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <div class="post-meta">
                  <span>
                    <xsl:value-of select="substring(pubDate, 6, 11)"/>
                  </span>
                  <xsl:if test="category">
                    <span><xsl:text>· </xsl:text><xsl:value-of select="category"/></span>
                  </xsl:if>
                </div>
                <h3 class="post-title">
                  <a>
                    <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h3>
                <p class="post-desc">
                  <xsl:value-of select="description"/>
                </p>
              </li>
            </xsl:for-each>
          </ol>

          <div class="footer">
            <a href="/">← BACK · RICHTERMAX.COM</a>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
