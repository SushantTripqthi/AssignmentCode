def linear_search(records, target_value, key):
    """
    Search records sequentially using Linear Search.

    Returns:
        Index of the first matching record.
        Returns -1 when no match is found.
    """

    target = target_value

    if isinstance(target, str):
        target = target.lower().strip()

    for index in range(len(records)):

        value = records[index][key]

        if isinstance(value, str):
            value = value.lower().strip()

        if value == target:
            return index

    return -1