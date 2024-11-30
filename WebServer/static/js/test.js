const form_0 = document.getElementById("input_form_0")
const test_btn_back = document.getElementById("test_btn_back")
const test_btn_1 = document.getElementById("test_btn_1")
const test_btn_2 = document.getElementById("test_btn_2")
const label_0 = document.getElementById("label_0")

test_btn_back.onclick = function()
{
    // NOTE: 이동하고 싶은 페이지의 URI를 작성하면 됩니다.
    window.location = "/"
}

form_0.addEventListener("submit", (event) =>
{
    const hiddenInput0 = document.createElement("input")
    hiddenInput0.type = "hidden"
    hiddenInput0.name = "name0"
    hiddenInput0.value = "input0"

    const hiddenInput1 = document.createElement("input")
    hiddenInput0.type = "hidden"
    hiddenInput0.name = "name1"
    hiddenInput0.value = "input1"

    form_0.appendChild(hiddenInput0)
    form_0.appendChild(hiddenInput1)
})

test_btn_1.onclick = async function(event)
{
    let name0 = "input2"
    let name1 = "input3"
    let input0 = document.getElementById("test_input_2").value
    let input1 = document.getElementById("test_input_3").value

    let response = await fetch("/test/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name0, name1, input0, input1 })
    })

    let result = await response.json()
    console.log(result)
}

test_btn_2.onclick = async function(event)
{
    let selectedOpcode = document.querySelector("input[name=opcode]:checked")
    let opcode = selectedOpcode.getAttribute("opcode")
    let operand_a = document.getElementById("test_input_a").value
    let operand_b = document.getElementById("test_input_b").value

    let response = await fetch(`/test/calc/${opcode}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ opcode, operand_a, operand_b })
    })

    let result = await response.json()
    label_0.innerText = `결과: ${result.data}`
    console.log(result)
}