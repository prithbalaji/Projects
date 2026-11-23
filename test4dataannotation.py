from html.parser import HTMLParser
from urllib.request import Request, urlopen
import re


class _TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.current_row = None
        self.current_cell = None

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self.current_row = []
        elif tag == "td" or tag == "th":
            self.current_cell = []

    def handle_data(self, data):
        if self.current_cell is not None:
            self.current_cell.append(data)

    def handle_endtag(self, tag):
        if tag == "td" or tag == "th":
            if self.current_row is not None and self.current_cell is not None:
                self.current_row.append("".join(self.current_cell).strip())
            self.current_cell = None
        elif tag == "tr":
            if self.current_row:
                self.rows.append(self.current_row)
            self.current_row = None


def print_grid(url):
    # Published Google Docs use /document/d/e/.../pub and are accessible directly.
    # Do not convert this URL into a private /document/d/{id}/export URL.
    document_url = url

    request = Request(document_url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request) as response:
        html = response.read().decode("utf-8")

    parser = _TableParser()
    parser.feed(html)

    characters = {}
    headers = None

    for row in parser.rows:
        normalized = [value.strip().lower() for value in row]

        if headers is None:
            if "x-coordinate" in normalized and "y-coordinate" in normalized:
                headers = normalized
            continue

        if len(row) < 3:
            continue

        x_index = headers.index("x-coordinate")
        y_index = headers.index("y-coordinate")
        char_index = next(
            (
                i
                for i, name in enumerate(headers)
                if name in ("character", "char", "unicode character")
            ),
            None,
        )

        if char_index is None:
            continue

        try:
            x = int(row[x_index])
            y = int(row[y_index])
            character = row[char_index]

            if character:
                characters[(x, y)] = character
        except (ValueError, IndexError):
            continue

    if not characters:
        raise ValueError("No character grid data was found")

    max_x = max(x for x, y in characters)
    max_y = max(y for x, y in characters)

    for y in range(max_y + 1):
        print("".join(characters.get((x, y), " ") for x in range(max_x + 1)))


print_grid("https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub")
