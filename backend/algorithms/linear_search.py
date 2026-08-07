from algorithms.comparison_counter import ComparisonCounter


def linear_search(records, key, value, counter=None):
    """
    Search records sequentially using Linear Search.

    Returns all matching records.
    """

    if counter is None:
        counter = ComparisonCounter()

    results = []

    target = str(value).strip().lower()

    for record in records:

        counter.increment()

        record_value = getattr(record, key)

        if hasattr(record_value, "value"):
            record_value = record_value.value

        if str(record_value).strip().lower() == target:
            results.append(record)

    return results