#pragma strict

var gameName:String = "indot_TicTacToe";

private var refreshing:boolean;
private var hostData:HostData[];

private var btnX:float;
private var btnY:float;
private var btnW:float;
private var btnH:float;

function Start(){
	btnX = Screen.width * 0.05;
	btnY = Screen.width * 0.05;
	btnW = Screen.width * 0.1;
	btnH = Screen.width * 0.1;
}

function startServer(){
	var number = Random.Range(25000,26000);
	Network.InitializeServer(1, number, !Network.HavePublicAddress);
	MasterServer.RegisterHost(gameName, "Let's Play", "Tic Tac Toe Game");
}

function Update(){
	MasterServer.RequestHostList(gameName);
	if(MasterServer.PollHostList().Length > 0){
			
		var tempHostData : HostData[] = MasterServer.PollHostList();
		var cont : int = 0;
		
		hostData = new HostData[MasterServer.PollHostList().Length];
		
		for(var i:int = 0; i<tempHostData.length; i++){	
			hostData[cont] = tempHostData[i];
			cont++;
		}
	}
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

function OnFailedToConnectToMasterServer(info : NetworkConnectionError) {
		Debug.Log("Could not connect to master server: "+ info);
}

function OnFailedToConnect(){
	if(!Network.isClient){
		startServer();
		//refreshing = false;
		Debug.Log("Starting Server");
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

function OnPlayerConnected(){
	/*MasterServer.UnregisterHost();
	MasterServer.ClearHostList();*/
	/*Network.maxConnections = -1;*/
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
			Debug.Log(hostData);
			if(hostData != null){
				for(var i:int = 0; i<hostData.length; i++){
					if(!Network.isClient && hostData[i] != null){
						Network.Connect(hostData[i]);
						Debug.Log("Joining Game");
					}
				}
			}
			else if(!Network.isClient){
				startServer();
				Debug.Log("Starting Server");
			}
		}
	}
}