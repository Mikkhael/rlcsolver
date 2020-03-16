class CircutElement
{
    constructor(type = CircutElement.Type.Node, connections = [], value = new NumericValue(0))
    {
        // CircutElement.Type
        this.type = type;
        
        // [ids]
        this.connections = connections; // for Components must have length of 2
        
        // NumericValue
        this.value = value;
    }
    
    connectTo(id)
    {
        for(const x of this.connections)
        {
            if(x === id)
            {
                return;
            }
        }
        
        this.connections.push(id);
    }
    
    deconnectFrom(id)
    {
        const index = this.connections.indexOf(id);
        if(index > -1)
        {
            this.connections.splice(index, 1);
        }
    }
    
    isNode()
    {
        return this.type == CircutElement.Type.Node;
    }
    
    isComponent()
    {
        return !this.isNode();
    }
}

CircutElement.Type = {
    Node: 0,
    Resistor: 1,
    Capacitor: 2,
    Inductor: 3
}

class Circut
{
    constructor(elements = {})
    {
        // {id: CircutElement}
        this.elements = elements;
        
        
        this._nextFreeId = Object.keys(elements).length;
        this._releasedIds = [];
    }
    
    connect(fromId, toId)
    {
        if(this.elements[fromId] && this.elements[toId])
        {
            this.elements[fromId].connectTo(toId);
            this.elements[toId].connectTo(fromId);
        }
    }
    
    deconnectElement(id)
    {
        for(const connection of this.elements[id].connections)
        {
            if(this.elements.hasOwnProperty(connection))
            {
                this.elements[connection].deconnectFrom(id);
            }
        }
    }
    
    getNextId()
    {
        if(this._releasedIds.length > 0)
        {
            return this._releasedIds.pop();
        }
        return this._nextFreeId++;
    }
    
    addElement(element)
    {
        const id = this.getNextId();
        if(this.elements.hasOwnProperty(id))
        {
            alert("Internal Error");
            throw "Internal Error";
        }
        this.elements[id] = element;
    }
    
    replaceElement(id, element)
    {
        this.elements[id] = element;
    }
    
    deleteElement(id, deconnect = true)
    {
        if(this.elements.hasOwnProperty(id))
        {
            if(deconnect)
            {
                deconnectElement(id);
            }
            
            this._releasedIds.push(id);
            delete this.elements[id];
        }
    }
    
    clear()
    {
        this.elements = {};
        this._nextFreeId = 0;
        this._releasedIds = [];
    }
}