from contextlib import contextmanager
import logging
import time
from typing import Generator


@contextmanager
def timer(logger: logging.Logger | None = None, context: str | None = None) -> Generator[None, None, None]:
    start = time.perf_counter_ns()
    yield
    stop = time.perf_counter_ns()
    elapsed_time = stop - start
    msg = f"Elapsed time: {elapsed_time / 1_000_000:.3f}ms {context if context else ''}"
    if logger:
        logger.critical(msg)
    else:
        logging.critical(msg)
