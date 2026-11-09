# {{ .Title }}

Author: [Wim Deblauwe]({{ "about/" | absURL }}) | Published: {{ .Date.Format "2006-01-02" }}
{{- if and (not .Lastmod.IsZero) (ne (.Lastmod.Format "2006-01-02") (.Date.Format "2006-01-02")) }} | Updated: {{ .Lastmod.Format "2006-01-02" }}{{ end }}
{{- with .Params.tags }} | Topics: {{ delimit . ", " }}{{ end }} | Canonical: {{ .Permalink }}

{{/* The rendered article HTML; scripts/html-to-markdown.mjs turns it into Markdown after the build. */ -}}
<!--html-to-markdown {{ .Permalink }}-->
{{ .Content }}
<!--/html-to-markdown-->
