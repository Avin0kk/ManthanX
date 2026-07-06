from typing import TypedDict
from langgraph.graph import StateGraph, START, END

class ToyState(TypedDict):
    message: str

def node_greet(state: ToyState) -> dict:
    print("Running node_greet")
    return {"message": state["message"] + " -> greeted"}

def node_farewell(state: ToyState) -> dict:
    print("Running node_farewell")
    return {"message":state["message"] + " -> said farewell"}

def build_toy_graph():
    graph = StateGraph(ToyState)

    graph.add_node("greet", node_greet)
    graph.add_node("farewell", node_farewell)

    graph.add_edge(START, "greet")
    graph.add_edge("greet","farewell")
    graph.add_edge("farewell", END)

    return graph.compile()