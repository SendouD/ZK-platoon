import type React from 'react';
import { useProofGeneration } from '../../hooks/useProofGeneration.jsx';
import { useOnChainVerification } from '../../hooks/useOnChainVerification.jsx';
import { useOffChainVerification } from '../../hooks/useOffChainVerification.jsx';
import { useState, useRef, useEffect, JSX } from 'react';

type CommandHistoryItem = {
    command: string;
    output: string;
};

export default function Terminal({
    start,
    setStart,
    setfaulty,
    setCount,
    count,
    swap,
    setSwap
}: {
        
    setSwap :(val:boolean)=>void;
    swap:boolean;
    count: number;
    setStart: (val: boolean) => void;
    setfaulty: (val: boolean) => void;
    setCount: (val: number) => void;
    start: boolean;
}) {
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([
        {
            command: 'help',
            output:
                'Available commands: help, clear, echo, date, whoami, ls, about , setfaulty , start,stop',
        },
    ]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [inputHistory, setInputHistory] = useState<string[]>([]);
    const [proofInput, setProofInput] = useState<
        | {
            vehicles: string[];
            Vehicle_Response: string[][];
            vehicle_name: string;
        }
        | undefined
    >();
    const { noir, proofData, backend } = useProofGeneration(proofInput);
    useOffChainVerification(backend!, noir!, proofData!);
    useOnChainVerification(proofData);

    const proofSubmit = (vehicle: string) => {
        setProofInput({
            vehicles: ['A', 'B', 'C', 'D', 'E', 'F'],
            Vehicle_Response:[
                ['0', 'B'],
                ['A', 'C'],
                ['B', 'F'],
                ['C', 'E'],
                ['D', 'F'],
                ['C', '1'],
            ],
            vehicle_name: vehicle,
        });
    };

    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Focus the input when the component mounts
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        // Scroll to the bottom when command history changes
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [commandHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim()) return;

        setInputHistory(prev => [...prev, input]);
        setHistoryIndex(-1);

        const command = input.trim();

        // Await the result
        const output = await processCommand(command);

        // Ensure output is a string or JSX before setting state
        setCommandHistory(prev => [...prev, { command, output: output ?? '' }]);

        setInput('');
    };
    const processCommand = async (command: string): Promise<string | JSX.Element> => {
        const [cmd, ...args] = command.split(' ');

        switch (cmd.toLowerCase()) {
            case 'help':
                return 'Available commands: help, clear, echo, date, whoami, ls, about, setfaulty, start, prove';

            case 'clear':
                setTimeout(() => {
                    setCommandHistory([]);
                }, 100);
                return 'Clearing terminal...';

            case 'echo':
                return args.join(' ') || '';

            case 'date':
                return new Date().toString();

            case 'whoami':
                return 'browser-user';
            case 'start':
                setStart(true);
                return 'Simulation has been started';
            case 'stop':
                setStart(false);
                return 'Simulation Stopped';
            case 'setfaulty':
                if (count == 2) {
                    return 'Maximum number of malicious trucks has been set already';
                }
                if (!start) {
                    return 'Simulation need to be started';
                }
                setfaulty(true);

                return 'Malicious Node has been set';
            case 'about':
                return 'Browser CLI v1.0.0 - A terminal emulator for the web';
            case 'swap':
                  if (!start) {
                    return 'Simulation need to be started';
                }
                setSwap(true);
                return 'Nodes are swapped' 
            case 'prove':
                  if (!start) {
                    return 'Simulation need to be started';
                }
                console.log(args);
                if (args.length !==1) {
                    return 'Error: Missing argument. Usage: prove <vehicle_name>';
                }
                console.log('function triggered');
                proofSubmit(args[0]);
                return 'Proof Generating';
            default:
                return `Command not found: ${cmd}. Type 'help' for available commands.`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Handle up arrow for history navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (inputHistory.length > 0 && historyIndex < inputHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(inputHistory[inputHistory.length - 1 - newIndex]);
            }
        }

        // Handle down arrow for history navigation
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(inputHistory[inputHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }

        // Handle tab for auto-complete (simplified version)
        if (e.key === 'Tab') {
            e.preventDefault();
            const commands = ['help', 'clear', 'echo', 'date', 'whoami', 'ls', 'about', 'prove'];
            const matchingCommands = commands.filter(cmd => cmd.startsWith(input));

            if (matchingCommands.length === 1) {
                setInput(matchingCommands[0]);
            }
        }
    };

    const clearTerminal = () => {
        setCommandHistory([]);
    };

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
            <div
                ref={terminalRef}
                className="bg-black p-4 h-80 overflow-y-auto font-mono text-sm text-gray-200"
            >
                <div className="mb-4">
                    <p className="text-green-400">ZKP PLATOON</p>
                </div>

                {commandHistory.map((item, index) => (
                    <div key={index} className="mb-2">
                        <div className="flex items-center text-green-400">
                            <span className="ml-1 font-bold">~$</span>
                            <span className="ml-2">{item.command}</span>
                        </div>
                        <div className="ml-6 mt-1 text-gray-300">{item.output}</div>
                    </div>
                ))}

                <form onSubmit={handleSubmit} className="flex items-center mt-2">
                    <div className="flex items-center text-green-400">
                        <span className="ml-1 font-bold">~$</span>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 ml-2 bg-transparent outline-none text-white"
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                    />
                </form>
            </div>
        </div>
    );
}
