#pragma strict

public static var playerTurn : boolean = false;
public static var playerID : int = -1;

private static var gameMatrix : int[] = new int[9];
private static var win : int = 0;
private static var loss : int = 0;
private static var tie : int = 0;

public static var playable : boolean = false;

public var B0 : GameObject;
public var B1 : GameObject;
public var B2 : GameObject;
public var B3 : GameObject;
public var B4 : GameObject;
public var B5 : GameObject;
public var B6 : GameObject;
public var B7 : GameObject;
public var B8 : GameObject;

public var M1 : Material;
public var M2 : Material;

public var winCount : GUIText;
public var lossCount : GUIText;
public var tieCount : GUIText;

function Start () {
	restartBoard();
}

function Update () {
	//check if the left mouse has been pressed down this frame
    if (Input.GetMouseButtonDown(0) && playable)
    {
        //empty RaycastHit object which raycast puts the hit details into
        var hit : RaycastHit;
        //ray shooting out of the camera from where the mouse is
        var ray : Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
 
        if (Physics.Raycast(ray, hit))
        {
        	var id : int = hit.collider.gameObject.GetComponent(blockProperties).id;
            if(playerTurn == true){
            	if(gameMatrix[id] == -1){
            		networkView.RPC("changeGameMatrix", RPCMode.All, id, playerID);
            		playerTurn = false;
            		networkView.RPC("changeTurn", RPCMode.Others);
            		if(playerID == 0){
            			networkView.RPC("changeColor", RPCMode.All, Vector3(Color.blue.r,Color.blue.g,Color.blue.b), hit.collider.gameObject.name);
            		}
            		else{
            			networkView.RPC("changeColor", RPCMode.All, Vector3(Color.red.r,Color.red.g,Color.red.b), hit.collider.gameObject.name);
            		}
            		if(checkBoardWin()){
            			win++;
            			networkView.RPC("addLoss", RPCMode.Others);	
            			networkView.RPC("restartBoard", RPCMode.All);	
            		}
            		if(checkBoardTie()){
            			networkView.RPC("addTie", RPCMode.All);	
            			networkView.RPC("restartBoard", RPCMode.All);	
            		}
            	}
            }
        }
    }
}

@RPC
function changeColor(color : Vector3, blockName : String){
	var block : GameObject = GameObject.Find(blockName);
	block.renderer.material.color = Color(color.x,color.y,color.z);
}

@RPC
function changeGameMatrix(id : int, pID : int){
	gameMatrix[id] = pID;
}

@RPC
function changeTurn(){
	playerTurn = true;
}

@RPC
function restartBoard(){
	for(var i : int = 0; i < 9; i ++){
		gameMatrix[i] = -1;
	}
	B0.renderer.material = M1;
	B1.renderer.material = M2;
	B2.renderer.material = M1;
	B3.renderer.material = M2;
	B4.renderer.material = M1;
	B5.renderer.material = M2;
	B6.renderer.material = M1;
	B7.renderer.material = M2;
	B8.renderer.material = M1;
	winCount.text = win.ToString();
	lossCount.text = loss.ToString();
	tieCount.text = tie.ToString();
}

@RPC
function addTie(){
	tie++;
}

@RPC
function addLoss(){
	loss++;
}

function checkBoardTie() : boolean{
	for(var i : int = 0; i < 9; i ++){
		if(gameMatrix[i] == -1){
			return false;
		}
	}
	return true;
}

function checkBoardWin() : boolean{
	if(gameMatrix[0] == playerID && gameMatrix[1] == playerID && gameMatrix[2] == playerID)
		return true;
	else if(gameMatrix[3] == playerID && gameMatrix[4] == playerID && gameMatrix[5] == playerID)
		return true;
	else if(gameMatrix[6] == playerID && gameMatrix[7] == playerID && gameMatrix[8] == playerID)
		return true;
	else if(gameMatrix[0] == playerID && gameMatrix[3] == playerID && gameMatrix[6] == playerID)
		return true;
	else if(gameMatrix[1] == playerID && gameMatrix[4] == playerID && gameMatrix[7] == playerID)
		return true;
	else if(gameMatrix[2] == playerID && gameMatrix[5] == playerID && gameMatrix[8] == playerID)
		return true;
	else if(gameMatrix[0] == playerID && gameMatrix[4] == playerID && gameMatrix[8] == playerID)
		return true;
	else if(gameMatrix[2] == playerID && gameMatrix[4] == playerID && gameMatrix[6] == playerID)
		return true;
	return false;
}