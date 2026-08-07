from algorithms.comparison_counter import increment


def insertion_sort(records, key):

    arr = records[:]

    n = len(arr)

    for i in range(1, n):

        current = arr[i]

        j = i - 1

        while j >= 0:

            increment()

            if getattr(arr[j], key) > getattr(current, key):

                arr[j + 1] = arr[j]

                j -= 1

            else:
                break

        arr[j + 1] = current

    return arr