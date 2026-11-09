# {{ .Title }}

Author: [Wim Deblauwe]({{ "about/" | absURL }}) | Canonical: {{ .Permalink }}

{{/* The rendered page HTML; scripts/html-to-markdown.mjs turns it into Markdown after the build. */ -}}
<!--html-to-markdown {{ .Permalink }}-->
{{ .Content }}
<!--/html-to-markdown-->
