import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Moon, Sun, User } from "lucide-react"
import { useTheme } from "../../components/template/ThemeProvider"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import useAuthStore from "../../store/useAuthStore"
import { loginUser } from "../../api/auth"
import { sendToast } from "../../components/utilis"

const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const { setTheme, theme } = useTheme()
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Use the actual API call instead of simulation
            const { data, status } = await loginUser({ email, password })

            console.log('response from server: ', data)


            if (data?.success === true) {
                sendToast("success", data?.message)
                let user = data?.user
                login({
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    token: user.token // Include the token
                })

                navigate("/dashboard")

            } else {
                sendToast("error", data?.message)
            }


        } catch (error) {
            setError("Failed to connect to server. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="absolute top-4 right-4 flex space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-2">
                        <img src="/logo.png" alt="Tech Tutoring Logo" className="h-12 w-auto" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Tech Tutoring System</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                        <p className="mt-4 text-center text-sm text-muted-foreground">
                            <span className="hover:text-primary cursor-pointer">Forgot password?</span>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default LoginPage






// import { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { Eye, EyeOff, Lock, Moon, Sun, User } from "lucide-react"
// import { useTheme } from "../../components/template/ThemeProvider"
// import { Button } from "../../components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
// import { Input } from "../../components/ui/input"
// import { Label } from "../../components/ui/label"
// import useAuthStore from "../../store/useAuthStore"

// const LoginPage = () => {
//     const [email, setEmail] = useState("")
//     const [password, setPassword] = useState("")
//     const [showPassword, setShowPassword] = useState(false)
//     const [isLoading, setIsLoading] = useState(false)
//     const { setTheme, theme } = useTheme()
//     const navigate = useNavigate()
//     const { login } = useAuthStore()

//     const handleLogin = async (e) => {
//         e.preventDefault()
//         setIsLoading(true)

//         try {
//             // Simulate login - replace with actual API call
//             await new Promise((resolve) => setTimeout(resolve, 1000))

//             // Mock response - in real app, this would come from your API
//             const userData = {
//                 id: "user123",
//                 name: "John Doe",
//                 email,
//                 role: email.includes("admin") ? "admin" : email.includes("tutor") ? "tutor" : "student",
//             }

//             login(userData)
//             navigate("/dashboard")
//         } catch (error) {
//             console.error("Login failed:", error)
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const toggleTheme = () => {
//         setTheme(theme === "dark" ? "light" : "dark")
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-background p-4">
//             <div className="absolute top-4 right-4 flex space-x-2">
//                 <Button variant="ghost" size="icon" onClick={toggleTheme}>
//                     {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//                     <span className="sr-only">Toggle theme</span>
//                 </Button>
//             </div>

//             <Card className="w-full max-w-md">
//                 <CardHeader className="space-y-1 text-center">
//                     <div className="flex justify-center mb-2">
//                         <img src="/logo.png" alt="Atom Logo" className="h-12 w-auto" />
//                     </div>
//                     <CardTitle className="text-2xl font-bold">Tech Tutoring System</CardTitle>
//                     <CardDescription>Enter your credentials to access your dashboard</CardDescription>
//                 </CardHeader>
//                 <form onSubmit={handleLogin}>
//                     <CardContent className="space-y-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="email">Email</Label>
//                             <div className="relative">
//                                 <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                                 <Input
//                                     id="email"
//                                     placeholder="name@example.com"
//                                     type="email"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     className="pl-10"
//                                     required
//                                 />
//                             </div>
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="password">Password</Label>
//                             <div className="relative">
//                                 <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
//                                 <Input
//                                     id="password"
//                                     type={showPassword ? "text" : "password"}
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     className="pl-10 pr-10"
//                                     required
//                                 />
//                                 <Button
//                                     type="button"
//                                     variant="ghost"
//                                     size="icon"
//                                     className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                 >
//                                     {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                                     <span className="sr-only">Toggle password visibility</span>
//                                 </Button>
//                             </div>
//                         </div>
//                     </CardContent>
//                     <CardFooter className="flex flex-col">
//                         <Button type="submit" className="w-full" disabled={isLoading}>
//                             {isLoading ? "Signing in..." : "Sign In"}
//                         </Button>
//                         <p className="mt-4 text-center text-sm text-muted-foreground">
//                             <span className="hover:text-primary cursor-pointer">Forgot password?</span>
//                         </p>
//                     </CardFooter>
//                 </form>
//             </Card>
//         </div>
//     )
// }

// export default LoginPage

