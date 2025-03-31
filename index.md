---
layout: default
title: Vega Lyrae | Twitch Streamer & Computer Scientist
---

{% capture readme_content %}{% include_relative README.md %}{% endcapture %}
{% assign content_parts = readme_content | split: "## 📑 Site Navigation" %}
{% assign main_content = content_parts[1] | split: "## 👋 About Me" %}
{{ main_content[1] }}
