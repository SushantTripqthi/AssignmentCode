from algorithms.comparison_counter import increment


def linear_search(records, key, value):

    result = []

    for item in records:

        increment()

        if str(getattr(item, key)).lower() == str(value).lower():

            result.append(item)

    return result