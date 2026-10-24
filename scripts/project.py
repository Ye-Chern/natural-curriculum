"""Small, dependency-free entry point for Windows, Linux and macOS authors."""
from __future__ import annotations

import argparse
import hashlib
import io
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = (ROOT / ".quarto-version").read_text().strip()
LOCAL = ROOT / ".local" / f"quarto-{VERSION}"


def executable() -> str:
    override = os.environ.get("QUARTO_BIN")
    candidates = [override, shutil.which("quarto")]
    candidates += [str(p) for p in LOCAL.glob("**/bin/quarto*") if p.name in {"quarto", "quarto.exe", "quarto.cmd"}]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            result = subprocess.run([candidate, "--version"], capture_output=True, text=True, check=True)
            if result.stdout.strip() != VERSION:
                continue
            return candidate
    raise SystemExit(f"Quarto {VERSION} not found. Run: python scripts/project.py setup")


def download(url: str) -> bytes:
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "natural-curriculum"}), timeout=120) as response:
        return response.read()


def setup() -> None:
    try:
        print(f"Using {executable()}", flush=True)
        return
    except SystemExit:
        pass
    system = platform.system()
    machine = platform.machine().lower()
    if system == "Windows" and machine in {"amd64", "x86_64"}:
        suffix = "win.zip"
    elif system == "Linux" and machine in {"x86_64", "amd64", "aarch64", "arm64"}:
        suffix = f"linux-{'amd64' if machine in {'x86_64', 'amd64'} else 'arm64'}.tar.gz"
    elif system == "Darwin":
        suffix = "macos.tar.gz"
    else:
        raise SystemExit(f"Install Quarto {VERSION} manually on {system}/{machine}; set QUARTO_BIN.")
    filename = f"quarto-{VERSION}-{suffix}"
    base = f"https://github.com/quarto-dev/quarto-cli/releases/download/v{VERSION}/"
    checksums = download(base + f"quarto-{VERSION}-checksums.txt").decode()
    expected = next(line.split()[0] for line in checksums.splitlines() if line.split()[-1].lstrip("*") == filename)
    print(f"Downloading {filename} (SHA-256 checked against release manifest)…", flush=True)
    data = download(base + filename)
    if hashlib.sha256(data).hexdigest() != expected:
        raise SystemExit("Quarto checksum mismatch; nothing extracted.")
    LOCAL.mkdir(parents=True, exist_ok=True)
    if suffix.endswith("zip"):
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            for info in archive.infolist():
                if not (LOCAL / info.filename).resolve().is_relative_to(LOCAL.resolve()):
                    raise SystemExit("Unsafe archive path")
            archive.extractall(LOCAL)
    else:
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            archive.extractall(LOCAL, filter="data")
    print(f"Ready: {executable()}", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["setup", "render", "preview", "check", "verify"])
    args, extra = parser.parse_known_args()
    os.chdir(ROOT)
    if args.command == "verify":
        npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
        if not npm:
            raise SystemExit("Node.js/npm not found. See HELP.md: browser tests.")
        commands = [
            [npm, "test"],
            [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py"],
            [sys.executable, "scripts/sync_content.py", "--check"],
            [sys.executable, "scripts/project.py", "render"],
            [sys.executable, "scripts/project.py", "check"],
            [npm, "run", "test:browser"],
        ]
        for command in commands:
            print(f"Running: {' '.join(command)}", flush=True)
            subprocess.run(command, check=True)
        return
    if args.command == "setup":
        setup()
        return
    if args.command in {"render", "preview"}:
        subprocess.run([sys.executable, "scripts/sync_content.py"], check=True)
    if args.command == "check":
        subprocess.run([sys.executable, "scripts/sync_content.py", "--check"], check=True)
        subprocess.run([sys.executable, "scripts/check_site.py"], check=True)
    else:
        raise SystemExit(subprocess.call([executable(), args.command, *extra]))


if __name__ == "__main__":
    main()
