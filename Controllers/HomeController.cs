using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;
using TaskOne.Models;
using TaskOne.Method;

namespace TaskOne.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }
        public ActionResult GetAll()
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data/customer.json");
            string jsonContent = System.IO.File.ReadAllText(filePath);
            List<Customer> customers = JsonConvert.DeserializeObject<List<Customer>>(jsonContent);

            return Json(customers);
        }
 
        public ActionResult Login(User user)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data/user.json");
            string jsonContent = System.IO.File.ReadAllText(filePath);
            List<User> UserList = JsonConvert.DeserializeObject<List<User>>(jsonContent);

            var findUser = UserList!.FirstOrDefault(c => c.UserID == user.UserID);
            if(findUser == null) 
                return Json(false);

            //userID: testingUser, password: MyPassword28/2/2024

            bool isPasswordValid = PasswordHasher.VerifyPassword(user.Password, findUser.Password!);

            if (!isPasswordValid)
                return Json(false);

            findUser.Password = "";
            return Json(findUser);
        }
        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

  

    }


}
