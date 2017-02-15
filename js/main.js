angular.module('termApp', [])
    .controller('termCtrl', function($scope) {
        $scope.verNum = "0.0.1";

        var lineNumber = 1;

        $scope.stdout = [
            {
                id: 0,
                text: "Welcome to term! Version " + $scope.verNum
            }
        ];

        $scope.input = "";

        $scope.prompt = ">";

        writeLine = function(txt) {
            var lines = txt.split(/\r\n|\r|\n/g);
            if (lines.length > 1) {
                for (var line of lines) {
                    $scope.stdout.push({
                        id: lineNumber++,
                        text: line
                    })
                }
            } else {
                $scope.stdout.push({
                    id: lineNumber++,
                    text: txt
                })
            }
            scrollToBottom();
        }

        $scope.submit = function() {
            writeLine($scope.prompt + " " + $scope.input);
            
            var list = $scope.input.split(' ');
            var cmd = list[0];

            if (commands[cmd] != null) {
                var flags = {};
                var elsToRemove = [];
                for (var el of list) {
                    if (el.charAt(0) == "-") {
                        for (var i = 1; i < el.length; i++) {
                            if (commands[cmd].flags[el.charAt(i)] != null) {
                                flags[el.charAt(i)] = true;
                            } else {
                                writeLine("Unrecognised flag " + el.charAt(i) + ". Use 'help -f " + cmd + "' for full list of flags.");
                            }
                        }
                        elsToRemove.push(el);
                    }
                }

                for (var i = elsToRemove.length - 1; i >= 0; i--) {
                    list.splice(list.indexOf(elsToRemove[i]), 1);
			    }

                var args = list.slice(1);
                commands[cmd].func(args, flags);
            } else if ($scope.input.trim() != "") {
                writeLine("Unrecognised command. Use 'help -l' to list all available commands.")
            }
            
            $scope.input = "";
            scrollToBottom();
        }

        commands = {
            help: {
                name: "help",
                func: function(args, flags) {
                    if (flags["l"]) {
                        for (var cmd of Object.keys(commands)) {
                            writeLine(cmd);
                        }
                    } else if (args.length == 0) {
                        writeLine("Welcome to term, a javascript terminal implamented with AngularJS!\nTo see a list of all commands, use 'help -l', or to see help on how to use the help command, use 'help help'.")
                    } else {
                        for (var arg of args) {
                            if (commands[arg] != null) {
                                if (flags["f"]) {
                                    writeLine(commands[arg].longhelp);
                                } else {
                                    writeLine(commands[arg].help);
                                }
                                
                            } else {
                                writeLine(arg + " is not a recognised command.");
                            }
                        }
                    }

                    
                },
                flags: {
                    l: false,
                    f: false
                },
                help: "Shows help information for the given command.\nUsage: help [l f] (command)",
                longhelp: "Shows help information for the given command.\nUsage: help [l f] (command)\n  l: list all commands\n  f: full help text\n  command: the command you want more information on (optional)"
            },
            clear: {
                name: "clear",
                func: function(args, flags) {
                    $scope.stdout = [];
                    lineNumber = 0;
                },
                help: "Clears the screen",
                longhelp: "Clears the screen"
            },
            echo: {
                name: "echo",
                func: function(args, flags) {
                    writeLine(args.join(' '));
                },
                help: "Prints all text following the command to the screen",
                longhelp: "Prints all text following the command to the screen\n\\n doesn't work here."
            }
        };
    });

function scrollToBottom() {
    window.scrollTo(0,document.body.scrollHeight);
}