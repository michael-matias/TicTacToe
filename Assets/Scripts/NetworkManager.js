#pragma strict

var gameName:String = "indot_TicTacToe";

private var refreshing:boolean;
private var hostData:HostData[];

private var btnX:float;
private var btnY:float;
private var btnW:float;
private var btnH:float;

function Start(){
	refreshHostList();
	btnX = Screen.width * 0.05;
	btnY = Screen.width * 0.05;
	btnW = Screen.width * 0.1;
	btnH = Screen.width * 0.1;
}

function startServer(){
	Network.InitializeServer(1, 25001, !Network.HavePublicAddress);
	MasterServer.RegisterHost(gameName, "Let's Play", "Tic Tac Toe Game");
}

function refreshHostList(){
	MasterServer.RequestHostList(gameName);
	refreshing = true;
}

function Update(){
	if(refreshing){
		if(MasterServer.PollHostList().Length > 0){
			refreshing = false;
			hostData = MasterServer.PollHostList();
			Debug.Log(MasterServer.PollHostList().Length);
		}
		else{
			refreshHostList();
		}
	}
	//Debug.Log(Play.playerID);
}

// Messages
function OnServerInitialized(){
	Debug.Log("Server initialized!");
	Play.playerID = 0;
}

function OnMasterServerEvent(mse:MasterServerEvent){
	if(mse == MasterServerEvent.RegistrationSucceeded){
		Debug.Log("Registered Server!");
	}
}

function OnConnectedToServer(){
	Play.playerID = 1;
	Play.playerTurn = true;
	networkView.RPC("setPlayable", RPCMode.All);
	Debug.Log("PlayerConnected");
}

@RPC
function setPlayable(){
	Debug.Log("OK");
	Play.playable = true;
}

function OnPlayerDisconnected(){
	Play.playable = false;
}

function OnDisconnectedFromServer(){
	Play.playable = false;
}

// GUI
function OnGUI(){
	if(!Network.isClient && !Network.isServer){
		if(GUI.Button(Rect(btnX,btnY,btnW,btnH), "Play!")){
			if(hostData != null){
				for(var i:int = 0; i<hostData.length; i++){
					if(!Network.isClient){
						Network.Connect(hostData[i]);
						Debug.Log("Joining Game");
						refreshing = false;
						break;
					}
					else{
						break;
					}
				}
			}
			else if(!Network.isClient){
				startServer();
				refreshing = false;
				Debug.Log("Starting Server");
			}
		}
	}
}