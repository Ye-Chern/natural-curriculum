"""Check rendered local links, fragments, resources and unresolved citations."""
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / "_book"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.links = set(), []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            if key in attrs:
                self.links.append(attrs[key])


def main():
    pages = {path.resolve(): Page(path) for path in ROOT.rglob("*.html")}
    if not pages:
        raise SystemExit("No HTML found; render first.")
    errors = []
    for path, page in pages.items():
        raw = path.read_text(encoding="utf-8")
        if re.search(r'class="[^"]*\bcitation\b[^\"]*"[^>]*>\s*\[@', raw):
            errors.append(f"Unresolved citation in {path.name}")
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc or link.startswith("/"):
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if target.is_dir():
                target /= "index.html"
            if not target.exists():
                errors.append(f"{path.name}: missing {link}")
            elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                errors.append(f"{path.name}: missing fragment {link}")
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"Checked {len(pages)} HTML pages: local links, fragments, and resources OK.")


if __name__ == "__main__":
    main()
