export enum ProgramTreeType
{
    Input = "input",
    Func = "func",
    Output = "output"
}

export interface ProgramTreeNode
{
    type: ProgramTreeType;
}
export interface ProgramTreeInput extends ProgramTreeNode
{
    //The value retrieved from the input
    value: any;
}
export interface ProgramTreeFunc extends ProgramTreeNode
{
    //The array index of the arguments to retrieve when running the func
    argumentsIndexes: Array<number>;
    //The lambdas function to run
    func: (...args: Array<any>) => any;
    //The result of the function execution
    result: any;
}
export interface ProgramTreeOutput extends ProgramTreeNode
{
    //The index of the function to retrieve output from and print
    functionIndex: number;
}

const operations = {
    "+": (...args: Array<number>): number => {
        return args.reduce((a, b) => a + b);
    },
    "-": (...args: Array<number>): number => {
        return args.reduce((a, b) => a - b);
    },
    "*": (...args: Array<number>): number => {
        return args.reduce((a, b) => a * b);
    },
    "/": (...args: Array<number>): number => {
        return args.reduce((a, b) => a / b);
    }
};

export class ProgramExecutor
{

    private programCounter = 0;
    private programTree: Array<ProgramTreeNode>;

    private _reset()
    {
        this.programCounter = 0;
        this.programTree = [];
    }

    public load(nodes: any)
    {
        this._reset();
        //Later we go through the tree and set all the indices
        let inputs: Map<number, number> = new Map();
        let functions: Map<number, number> = new Map();
        Object.keys(nodes).forEach((key: string) => {
            const node = nodes[key];
            if(node.name == "input")
            {
                const index = this.programTree.push(<ProgramTreeInput>{
                    type: ProgramTreeType.Input,
                    value: null
                }) - 1;
                inputs.set(Number.parseInt(key), index);
            }
            else if(node.name == "numberRobot")
            {
                const operator = node.data.value as ("+" | "-" | "*" | "/");
                let args = Object.keys(node.inputs);
                let argumentsIndexes: Array<number> = [];
                args.forEach((key) => {
                    const input = node.inputs[key];
                    argumentsIndexes.push(input.connections.node);
                });
                const index = this.programTree.push(<ProgramTreeFunc>{
                    type: ProgramTreeType.Func,
                    argumentsIndexes: argumentsIndexes,
                    func: operations[operator]
                });
                functions.set(Number.parseInt(key), index);
            }
            else if(node.name == "printer")
            {
                this.programTree.push(<ProgramTreeOutput>{
                    type: ProgramTreeType.Output,
                    functionIndex: node.inputs.string.connections[0].node
                });
            }
        });
        //Go through the tree and set the indices
        this.programTree.forEach((node) => {
            if(node.type == ProgramTreeType.Output)
            {
                //Set the index of the function
                let outputNode = node as ProgramTreeOutput;
                outputNode.functionIndex = functions.get(outputNode.functionIndex);
            }
            else if(node.type == ProgramTreeType.Func)
            {
                let funcNode = node as ProgramTreeFunc;
                funcNode.argumentsIndexes = funcNode.argumentsIndexes.map((index) => inputs.get(index));
            }
        });
        console.log(this.programTree);
    }
    //Execute next instruction
    public next(): {type: ProgramTreeType, data: any}
    {
        const instruction = this.programTree[this.programCounter];
        let data = null;
        if(instruction.type == ProgramTreeType.Input)
        {
            //Ask for input and save the value into the variable, pass the current instruction 
        }
        else if(instruction.type == ProgramTreeType.Func)
        {
            //Get all the inputs from previous instructions
            //Execute the function and save the value into the output
            let args: any[] = [];
            const func = instruction as ProgramTreeFunc;
            func.argumentsIndexes.forEach((index) => {
                args.push((this.programTree[index] as ProgramTreeInput).value);
            });
            const result = func.func(args);
            func.result = result;
            //After that return back that the function was executed
        }
        else if(instruction.type == ProgramTreeType.Output)
        {
            //Get the function output and print back the result
            const output = instruction as ProgramTreeOutput;
            const func = this.programTree[output.functionIndex] as ProgramTreeFunc;
            //Return back the func output
            data = func.result;
        }
        this.programCounter++;
        return {type: instruction.type, data: data};
    }
    //The data will contain the current programCounter and the value
    public input(value: any)
    {
        const instruction = this.currentInstruction as ProgramTreeInput;
        instruction.value = value;
    }
    get currentInstruction()
    {
        return this.programTree[this.programCounter];
    }
}