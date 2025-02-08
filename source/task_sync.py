class TaskSync:
    def __init__(self):
        self.keep_running = True

    def stop(self):
        self.keep_running = False