comparison_count = 0


def reset_counter():
    global comparison_count
    comparison_count = 0


def increment():
    global comparison_count
    comparison_count += 1


def get_count():
    return comparison_count