import sys

def calc_add(a, b):
    return a + b

def calc_sub(a, b):
    return a - b

def calc_mul(a, b):
    return a * b

def calc_div(a, b):
    return a / b

if __name__ == "__main__":
    try:
        opcode = sys.argv[1]
        operand_a = int(sys.argv[2])
        operand_b = int(sys.argv[3])
        result = 0

        if opcode == "add":
            result = calc_add(operand_a, operand_b)
        elif opcode == "sub":
            result = calc_sub(operand_a, operand_b)
        elif opcode == "mul":
            result = calc_mul(operand_a, operand_b)
        elif opcode == "div":
            result = calc_div(operand_a, operand_b)
        else:
            exit(1)

        print(result)
        exit(0)
    except Exception as e:
        exit(1)