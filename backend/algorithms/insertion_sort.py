PRIORITY_ORDER = {
    "low": 1,
    "medium": 2,
    "high": 3
}


def _get_comparable_value(record, key):
    """
    Return a value that can be compared during sorting.

    Priority is converted to:
        low    -> 1
        medium -> 2
        high   -> 3
    """

    value = record[key]

    if key == "priority":
        value = str(value).lower()
        return PRIORITY_ORDER.get(value, 999)

    if isinstance(value, str):
        return value.lower()

    return value


def insertion_sort(records, key):
    """
    Sort a list of dictionary records in-place
    using the Insertion Sort algorithm.

    Parameters:
        records: list[dict]
        key: dictionary key used for sorting

    Returns:
        None
    """

    for i in range(1, len(records)):

        current_record = records[i]

        current_value = _get_comparable_value(
            current_record,
            key
        )

        j = i - 1

        while j >= 0:

            previous_value = _get_comparable_value(
                records[j],
                key
            )

            if previous_value > current_value:

                records[j + 1] = records[j]

                j -= 1

            else:
                break

        records[j + 1] = current_record