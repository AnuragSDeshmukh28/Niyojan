"""
Sliding-Window Rate Limiter Middleware — Niyojan
=================================================
Zero-dependency in-memory rate limiter. Attaches to FastAPI as a dependency.

Features:
  - Per-IP and per-endpoint keying
  - Sliding window algorithm (accurate, no burst artefacts)
  - 429 Too Many Requests with Retry-After and X-RateLimit-Limit headers
  - Thread-safe via collections.deque

Usage (in any router):
    from app.core.rate_limiter import rate_limit

    @router.post("/login", dependencies=[Depends(rate_limit(5, 60, "auth_login"))])
    async def login(...): ...
"""

import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import Depends, HTTPException, Request, status


class SlidingWindowRateLimiter:
    """
    Thread-safe sliding-window rate limiter backed by per-key deques.
    Each key typically encodes scope + client IP: "auth_login:127.0.0.1"
    """

    def __init__(self) -> None:
        self._requests: Dict[str, Deque[float]] = defaultdict(deque)

    def check(self, key: str, max_requests: int, window_seconds: int) -> dict:
        """
        Checks and records a request for the given key.
        Raises HTTP 429 if the window is exhausted.
        Returns metadata dict on success.
        """
        now = time.monotonic()
        window_start = now - window_seconds
        q = self._requests[key]

        # Evict timestamps outside the sliding window
        while q and q[0] <= window_start:
            q.popleft()

        if len(q) >= max_requests:
            retry_after = max(1, int(q[0] + window_seconds - now) + 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    f"Rate limit exceeded: {max_requests} requests per {window_seconds}s. "
                    f"Retry in {retry_after}s."
                ),
                headers={
                    "Retry-After":      str(retry_after),
                    "X-RateLimit-Limit": str(max_requests),
                    "X-RateLimit-Remaining": "0",
                },
            )

        q.append(now)
        return {
            "limit":     max_requests,
            "remaining": max_requests - len(q),
            "window_s":  window_seconds,
        }

    def reset(self, key: str) -> None:
        """Clears rate-limit state for a key (e.g. after successful auth)."""
        self._requests.pop(key, None)


# ── Singleton ──────────────────────────────────────────────────────────────
_limiter = SlidingWindowRateLimiter()


def rate_limit(max_requests: int, window_seconds: int, scope: str):
    """
    FastAPI dependency factory.

    Args:
        max_requests:   Maximum requests allowed in the window.
        window_seconds: Duration of the sliding window in seconds.
        scope:          A short label for the endpoint (e.g. "auth_login", "public_verify").

    Example:
        @router.post("/login", dependencies=[Depends(rate_limit(5, 60, "auth_login"))])
    """
    async def _dependency(request: Request) -> dict:
        client_ip = (
            request.client.host
            if request.client
            else request.headers.get("x-forwarded-for", "unknown").split(",")[0].strip()
        )
        key = f"{scope}:{client_ip}"
        return _limiter.check(key, max_requests, window_seconds)

    return _dependency
