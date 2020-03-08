class Connection
{
    constructor(destinationId, componnent)
    {
        this.destinationId = destinationId;
        this.componnent = componnent;
    }
}

class Component
{
    constructor(type = Component.Type.Wire, value = 0)
    {
        this.type = type;
        this.value = value;
    }
}
Component.prototype.Type = {
    Wire: 0,
    Resistor: 1,
    Capacitor: 2,
    Inductor: 3
}


class CircutNode
{
    constructor(id)
    {
        this.id = id;
        this.connections = [];
    }
}


class Circut
{
    constructor(nodes)
    {
        if(nodes instanceof Array)
        {
            this.nodes = {};
            for(let node of nodes)
            {
                nodes[node.id] = node;
            }
            
        }
        else // if Object
        {
            this.nodes = nodes;
        }
    }
}